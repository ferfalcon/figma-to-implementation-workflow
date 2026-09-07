#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConsumerBundle } from './build-consumer-bundle.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'astro-starter-test-'));
const revision = 'a'.repeat(40);
function read(path) { return readFileSync(path, 'utf8'); }
try {
  const result = buildConsumerBundle({ output: join(temp, 'bundle'), revision, starter: 'astro' });
  const repo = result.repositoryRoot;
  for (const path of [
    'package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json', '.gitignore',
    '.github/workflows/design-workflow-command.yml', '.github/workflows/validate-ui.yml',
    '.starter-source.json', 'ChatGPT-Project-Instructions.md', 'design-workflow.config.template.json',
    'src/pages/index.astro', 'src/pages/about.astro', 'src/layouts/Page.astro',
    'src/styles/global.css', 'public/mark.svg', 'public/horizon.svg',
    'playwright.config.ts', 'tests/site.spec.ts', 'scripts/validation-report.mjs',
  ]) assert(existsSync(join(repo, path)), path);
  const pkg = JSON.parse(read(join(repo, 'package.json')));
  const lock = JSON.parse(read(join(repo, 'package-lock.json')));
  assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies);
  assert.deepEqual(pkg.devDependencies, lock.packages[''].devDependencies);
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    assert.match(version, /^\d+\.\d+\.\d+$/, name + ' must have a maintained exact dependency version.');
    assert.equal(lock.packages['node_modules/' + name].version, version);
  }
  assert.equal(pkg.scripts.check, 'astro check');
  assert.equal(pkg.scripts.build, 'astro build');
  assert.equal(JSON.parse(read(join(repo, 'tsconfig.json'))).extends, 'astro/tsconfigs/strict');
  assert.deepEqual(JSON.parse(read(join(root, 'package.json'))).dependencies ?? {}, {}, 'The workflow CLI must stay dependency-free.');
  assert.deepEqual(JSON.parse(read(join(root, 'package.json'))).devDependencies ?? {}, {}, 'Starter tooling must stay separate.');
  assert(!Object.keys(pkg.dependencies).some(name => /react|tailwind/.test(name)));
  assert.equal(JSON.parse(read(join(repo, '.starter-source.json'))).toolkitRevision, revision);
  assert(read(join(repo, '.github/workflows/design-workflow-command.yml')).includes('@' + revision));
  assert(!read(join(repo, 'README.md')).includes('<TOOLKIT_REVISION>'));
  assert.equal(read(join(repo, 'ChatGPT-Project-Instructions.md')), read(join(root, 'AI-project-settings.md')));
  assert.equal(JSON.parse(read(join(repo, 'design-workflow.config.template.json'))).schemaVersion, 2);
  for (const absent of ['node_modules', 'dist', '.astro', 'docs/implementation-workflow', '.workflow']) assert(!existsSync(join(repo, absent)), absent);
  assert.throws(() => buildConsumerBundle({ output: root, revision, starter: 'astro' }), /toolkit sources/);
  assert.throws(() => buildConsumerBundle({ output: join(root, 'workflow'), revision }), /under dist/);
  assert.throws(() => buildConsumerBundle({ output: join(temp, 'bad'), revision, starter: 'react' }), /Only the astro/);
  assert.throws(() => buildConsumerBundle({ output: join(temp, 'bad'), revision: 'main' }), /exact 40-character/);

  const env = {
    ...process.env, TESTED_COMMIT: revision, GITHUB_REPOSITORY: 'example/product', GITHUB_RUN_ID: '123',
    DEPENDENCIES: 'success', TYPECHECK: 'success', BUILD: 'success', BROWSERS: 'success', TESTS: 'success',
  };
  function report(overrides = {}) {
    const result = spawnSync(process.execPath, [join(repo, 'scripts/validation-report.mjs')], {
      cwd: temp, encoding: 'utf8', env: { ...env, ...overrides },
    });
    return { result, evidence: JSON.parse(read(join(temp, 'validation-result.json'))) };
  }
  const success = report();
  assert.equal(success.result.status, 0);
  assert.equal(success.evidence.testedCommit, revision);
  assert.equal(success.evidence.passed, true);
  assert.match(success.result.stdout, /VALIDATION_RESULT=/);
  for (const overrides of [{ TYPECHECK: 'failure' }, { TESTS: 'skipped' }, { BUILD: 'cancelled' }, { BROWSERS: '' }, { TESTED_COMMIT: 'main' }]) {
    const failure = report(overrides);
    assert.equal(failure.result.status, 1);
    assert.equal(failure.evidence.passed, false);
  }
  const workflow = read(join(repo, '.github/workflows/validate-ui.yml'));
  assert(workflow.includes('github.event.pull_request.head.sha || github.sha'), 'Validate the implementation commit, including PR heads.');
  assert(workflow.includes('VALIDATION_RESULT') || workflow.includes('scripts/validation-report.mjs'));
  assert(workflow.includes('contents: read'));
  assert(!workflow.includes('pull_request_target'));
  assert(!workflow.includes('**.md'), 'Bookkeeping must not be presented as a UI validation trigger.');
  assert.deepEqual(readdirSync(repo).filter(name => name === 'node_modules'), []);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Astro starter generation, locked dependencies, immutable pins, output safety, and failing/stale check evidence passed.');
