#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConsumerBundle } from './build-consumer-bundle.mjs';
import { publishAstroStarter, readStarterSource } from './publish-astro-starter.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'starter-publisher-'));
const oldRevision = 'a'.repeat(40);
const revision = 'b'.repeat(40);
const repository = 'fixture/astro-template';
const base = '/repos/' + repository;
const blobSha = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');

try {
  const old = buildConsumerBundle({ output: join(temp, 'old'), revision: oldRevision, starter: 'astro' });
  const next = buildConsumerBundle({ output: join(temp, 'next'), revision, starter: 'astro' });
  const previous = readStarterSource(old.repositoryRoot, oldRevision);
  const expected = readStarterSource(next.repositoryRoot, revision);
  function provider({ dirty = false, missingMarker = false, concurrent = false, create = false, current = previous } = {}) {
    const calls = [];
    let refs = 0;
    const request = async (method, path, body) => {
      calls.push({ method, path, body });
      if (method === 'GET' && path === base) return create ? null : { full_name: repository, is_template: true, private: false, default_branch: 'main' };
      if (path === '/users/fixture') return { type: 'User' };
      if (path === '/user') return { login: 'fixture' };
      if (method === 'POST' && path === '/user/repos') {
        assert(body.is_template && body.auto_init && body.private === false);
        return { full_name: repository, is_template: true, private: false, default_branch: 'main' };
      }
      if (method === 'GET' && path === base + '/git/refs/heads/main') return { object: { sha: concurrent && ++refs > 1 ? 'e'.repeat(40) : 'c'.repeat(40) } };
      if (method === 'GET' && path.includes('/git/commits/')) return { tree: { sha: 'd'.repeat(40) }, parents: [] };
      if (method === 'GET' && path.includes('/contents/.starter-source.json')) return missingMarker ? null : { encoding: 'base64', content: current.files.get('.starter-source.json').toString('base64') };
      if (method === 'GET' && path.includes('/git/trees/')) {
        if (create) return { tree: [{ path: 'README.md', type: 'blob', mode: '100644', sha: 'd'.repeat(40) }], truncated: false };
        const tree = [...current.files].map(([path, bytes]) => ({ path, mode: '100644', type: 'blob', sha: blobSha(bytes) }));
        if (dirty) tree.push({ path: 'unexpected.txt', mode: '100644', type: 'blob', sha: 'f'.repeat(40) });
        return { tree, truncated: false };
      }
      if (method === 'POST' && path.endsWith('/git/blobs')) return { sha: blobSha(Buffer.from(body.content, 'base64')) };
      if (method === 'POST' && path.endsWith('/git/trees')) {
        assert.equal(body.tree.length, expected.files.size);
        assert(!('base_tree' in body), 'The verified generated template is replaced as one complete tree.');
        return { sha: 'f'.repeat(40) };
      }
      if (method === 'POST' && path.endsWith('/git/commits')) {
        assert.deepEqual(body.parents, ['c'.repeat(40)]);
        return { sha: '1'.repeat(40) };
      }
      if (method === 'PATCH' && path.endsWith('/git/refs/heads/main')) {
        assert.equal(body.force, false);
        return {};
      }
      throw new Error('Unexpected mock request: ' + method + ' ' + path);
    };
    return { request, calls };
  }
  for (const create of [false, true]) {
    const api = provider({ create });
    const result = await publishAstroStarter({ repository, source: next.repositoryRoot, revision, token: 'test-only', request: api.request });
    assert(result.changed);
    assert.equal(result.commit, '1'.repeat(40));
    assert.equal(api.calls.at(-1).method, 'PATCH');
  }
  for (const options of [{ dirty: true }, { missingMarker: true }, { concurrent: true }]) {
    const api = provider(options);
    await assert.rejects(publishAstroStarter({ repository, source: next.repositoryRoot, revision, token: 'test-only', request: api.request }), /Unexpected template edits|without generated starter provenance|Concurrent template update/);
    assert(!api.calls.some(call => call.method === 'PATCH'), 'Unexpected edits must never be overwritten.');
  }
  const noOp = provider({ current: expected });
  assert.equal((await publishAstroStarter({ repository, source: next.repositoryRoot, revision, token: 'test-only', request: noOp.request })).changed, false);
  assert(noOp.calls.every(call => call.method === 'GET'));
  await assert.rejects(publishAstroStarter({ repository: 'ferfalcon/figma-to-implementation-workflow', source: next.repositoryRoot, revision, token: 'test-only' }), /separate/);
  await assert.rejects(publishAstroStarter({ repository, source: next.repositoryRoot, revision }), /TOKEN is required/);
  writeFileSync(join(next.repositoryRoot, 'public/mark.svg'), 'changed after generation');
  assert.throws(() => readStarterSource(next.repositoryRoot, revision), /changed after generation/);
  const workflow = readFileSync(join(root, '.github/workflows/release-consumer-bundle.yml'), 'utf8');
  assert(workflow.includes('needs: verify'));
  assert(workflow.includes('node: [22, 24]'));
  assert(workflow.indexOf('check:release-readiness') < workflow.indexOf('publish-astro-starter.mjs'));
  for (const command of ['npm ci', 'npm run check', 'npm run build', 'npm run test:e2e']) assert(workflow.includes(command), command);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Starter publisher passed: source provenance, owned template updates, creation, idempotency, concurrent edits, and release gating.');
