#!/usr/bin/env node
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConsumerBundle } from './build-consumer-bundle.mjs';
import { checkReleaseReadiness } from './check-release-readiness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const markerPath = '.starter-source.json';
const SHA = /^[0-9a-f]{40}$/;
const blobSha = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');

export function readStarterSource(source, revision) {
  if (!SHA.test(revision || '')) throw new Error('An exact released toolkit revision is required.');
  const files = new Map();
  function walk(directory, prefix = '') {
    for (const item of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = prefix + item.name;
      if (item.isDirectory()) walk(join(directory, item.name), path + '/');
      else if (item.isFile()) files.set(path, readFileSync(join(directory, item.name)));
      else throw new Error('Starter publication does not accept symlinks or special files.');
    }
  }
  walk(source);
  const marker = JSON.parse(files.get(markerPath)?.toString('utf8') || 'null');
  if (marker?.schemaVersion !== 1 || marker.toolkitRepository !== toolkitRepository
    || marker.toolkitRevision !== revision || marker.starter !== 'astro' || !marker.files) {
    throw new Error('Starter provenance does not match the released toolkit.');
  }
  const actual = Object.fromEntries([...files].filter(([path]) => path !== markerPath).map(([path, bytes]) => [path, blobSha(bytes)]));
  if (!sameFiles(actual, marker.files)) throw new Error('Generated starter files changed after generation.');
  return { files, marker };
}

function sameFiles(actual, expected) {
  return expected && typeof expected === 'object' && !Array.isArray(expected)
    && Object.keys(actual).length === Object.keys(expected).length
    && Object.entries(actual).every(([path, sha]) => SHA.test(sha) && expected[path] === sha);
}

function githubRequest(token) {
  return async (method, path, body, { allow404 = false } = {}) => {
    const response = await fetch('https://api.github.com' + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error('GitHub ' + method + ' ' + path + ' failed (' + response.status + ').');
    return response.status === 204 ? null : response.json();
  };
}

// The CLI and release workflow enforce acceptance before calling this transport.
export async function publishAstroStarter({ repository, source, revision, token, request = githubRequest(token) }) {
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(repository || '')
    || repository.toLowerCase() === toolkitRepository.toLowerCase()) throw new Error('Choose a separate owner/name companion template repository.');
  if (!token) throw new Error('STARTER_PUBLISH_TOKEN is required.');
  const { files, marker } = readStarterSource(source, revision);
  const base = '/repos/' + repository;
  let info = await request('GET', base, undefined, { allow404: true });
  let created = false;
  if (!info) {
    const [owner, name] = repository.split('/');
    const account = await request('GET', '/users/' + owner);
    if (account.type !== 'Organization') {
      const user = await request('GET', '/user');
      if (user.login.toLowerCase() !== owner.toLowerCase()) throw new Error('The publisher token cannot create repositories for this owner.');
    }
    info = await request('POST', account.type === 'Organization' ? '/orgs/' + owner + '/repos' : '/user/repos', {
      name, private: false, auto_init: true, is_template: true,
      description: 'Maintained Astro starter generated from ' + toolkitRepository + '.',
    });
    created = true;
  }
  if (!info.is_template || info.private || info.full_name.toLowerCase() !== repository.toLowerCase()) {
    throw new Error('Publication requires the intended public GitHub template repository.');
  }
  const refPath = base + '/git/refs/heads/' + encodeURIComponent(info.default_branch);
  const head = (await request('GET', refPath)).object.sha;
  const parent = await request('GET', base + '/git/commits/' + head);
  if (created) {
    const initial = await request('GET', base + '/git/trees/' + parent.tree.sha + '?recursive=1');
    if (parent.parents?.length !== 0 || initial.truncated || initial.tree.length !== 1
      || initial.tree[0].path !== 'README.md' || initial.tree[0].type !== 'blob') {
      throw new Error('New template changed before its first generated commit; inspect it before recovery.');
    }
  } else {
    const currentFile = await request('GET', base + '/contents/' + markerPath + '?ref=' + head, undefined, { allow404: true });
    if (!currentFile || currentFile.encoding !== 'base64') throw new Error('Refusing to replace a repository without generated starter provenance.');
    const currentMarkerBytes = Buffer.from(currentFile.content, 'base64');
    const current = JSON.parse(currentMarkerBytes.toString('utf8'));
    if (current.schemaVersion !== 1 || current.starter !== 'astro' || current.toolkitRepository !== toolkitRepository || !SHA.test(current.toolkitRevision || '')) {
      throw new Error('Existing template belongs to another source.');
    }
    const tree = await request('GET', base + '/git/trees/' + parent.tree.sha + '?recursive=1');
    if (tree.truncated || tree.tree.some(item => item.type !== 'tree' && (item.type !== 'blob' || item.mode !== '100644'))) {
      throw new Error('Cannot verify the complete existing template tree.');
    }
    const actual = Object.fromEntries(tree.tree.filter(item => item.type === 'blob' && item.path !== markerPath).map(item => [item.path, item.sha]));
    if (!sameFiles(actual, current.files)) throw new Error('Unexpected template edits; reconcile them in canonical starter sources before publishing.');
    if (currentMarkerBytes.equals(files.get(markerPath))) return { repository, revision, commit: head, changed: false };
  }
  const tree = [];
  for (const [path, bytes] of files) {
    const blob = await request('POST', base + '/git/blobs', { content: bytes.toString('base64'), encoding: 'base64' });
    tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const nextTree = await request('POST', base + '/git/trees', { tree });
  const commit = await request('POST', base + '/git/commits', {
    message: 'Generate Astro starter from toolkit ' + marker.toolkitRevision,
    tree: nextTree.sha, parents: [head],
  });
  const observed = (await request('GET', refPath)).object.sha;
  if (observed !== head) throw new Error('Concurrent template update; refresh and retry after review.');
  await request('PATCH', refPath, { sha: commit.sha, force: false });
  return { repository, revision, commit: commit.sha, changed: true };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let directory;
  try {
    const args = process.argv.slice(2);
    const options = {};
    for (let index = 0; index < args.length; index += 2) {
      if (!['--repository', '--revision'].includes(args[index]) || !args[index + 1]) throw new Error('Usage: publish-astro-starter.mjs --repository owner/name --revision exact-sha');
      options[args[index].slice(2)] = args[index + 1];
    }
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
    if (options.revision !== git('rev-parse', 'HEAD')) throw new Error('Publish from the exact released checkout.');
    if (git('status', '--porcelain')) throw new Error('Publish from a clean toolkit checkout.');
    const report = JSON.parse(readFileSync(join(root, 'release/acceptance.json'), 'utf8'));
    const readiness = checkReleaseReadiness(report, options.revision);
    if (!readiness.ready) throw new Error('Publication is blocked: ' + readiness.findings.join('; '));
    directory = mkdtempSync(join(tmpdir(), 'publish-astro-starter-'));
    const result = buildConsumerBundle({ output: join(directory, 'bundle'), revision: options.revision, starter: 'astro' });
    const published = await publishAstroStarter({
      ...options, source: result.repositoryRoot, token: process.env.STARTER_PUBLISH_TOKEN,
    });
    console.log(JSON.stringify(published));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (directory) rmSync(directory, { recursive: true, force: true });
  }
}
