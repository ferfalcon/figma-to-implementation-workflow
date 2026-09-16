#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, mkdirSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { materializeAstroScaffold } from '../cli/lib/implementation-scaffold.mjs';
import { buildAstroScaffold } from './build-astro-scaffold.mjs';
import { validateCommandArgs } from './github-remote-command.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'astro-scaffold-test-'));
function read(path) { return readFileSync(path, 'utf8'); }
try {
  assert.deepEqual(
    validateCommandArgs(['implementation', 'scaffold', 'astro-typescript']),
    ['implementation', 'scaffold', 'astro-typescript'],
    'GitHub remote execution must carry the Stage-10 scaffold command through the canonical CLI.',
  );

  const result = buildAstroScaffold({ output: join(temp, 'repository') });
  const repo = result.outputRoot;
  for (const path of [
    'package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json', '.gitignore',
    '.github/workflows/design-workflow-ui.yml',
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
  assert.deepEqual(JSON.parse(read(join(root, 'package.json'))).devDependencies ?? {}, {}, 'Implementation-adapter tooling must stay separate.');
  assert(!Object.keys(pkg.dependencies).some(name => /react|tailwind/.test(name)));
  assert(!/\bstarter\b/i.test(read(join(repo, 'README.md'))), 'The internal Astro scaffold must not present itself as a consumer starter.');

  for (const absent of [
    'node_modules', 'dist', '.astro', 'docs/implementation-workflow', '.workflow',
    '.starter-source.json', 'Project-settings--Instructions.md', 'design-workflow.config.template.json',
    '.github/workflows/design-workflow-command.yml', 'LICENSE',
  ]) assert(!existsSync(join(repo, absent)), absent);

  assert.throws(() => buildAstroScaffold({ output: root }), /toolkit or adapter sources/);
  assert.throws(() => buildAstroScaffold({ output: dirname(root) }), /toolkit or adapter sources/);
  assert.throws(() => buildAstroScaffold({ output: join(root, 'workflow') }), /under dist/);
  assert.throws(() => buildAstroScaffold({ output: join(root, 'implementation-adapters/astro/scaffold/generated') }), /toolkit or adapter sources/);

  const nested = join(temp, 'nested-project');
  mkdirSync(join(nested, 'frontend'), { recursive: true });
  mkdirSync(join(nested, '.workflow'), { recursive: true });
  writeFileSync(join(nested, 'README.md'), 'Repository README\n');
  writeFileSync(join(nested, '.workflow', 'marker.txt'), 'workflow state\n');
  writeFileSync(join(nested, 'frontend', 'README.md'), 'Existing app note\n');
  const nestedResult = materializeAstroScaffold({ projectRoot: nested, implementationRoot: 'frontend' });
  assert.equal(nestedResult.implementationRoot, 'frontend');
  assert(nestedResult.preserved.includes('frontend/README.md'));
  assert(existsSync(join(nested, 'frontend', 'package.json')));
  assert(existsSync(join(nested, 'frontend', 'src', 'pages', 'index.astro')));
  assert.equal(read(join(nested, 'README.md')), 'Repository README\n');
  assert.equal(read(join(nested, '.workflow', 'marker.txt')), 'workflow state\n');
  assert.equal(read(join(nested, 'frontend', 'README.md')), 'Existing app note\n');
  const nestedWorkflow = read(join(nested, '.github', 'workflows', 'design-workflow-ui.yml'));
  assert(nestedWorkflow.includes("working-directory: 'frontend'"));
  assert(nestedWorkflow.includes("'frontend/src/**'"));
  assert(nestedWorkflow.includes("cache-dependency-path: 'frontend/package-lock.json'"));
  assert(nestedWorkflow.includes('frontend/validation-result.json'));
  const nestedAgain = materializeAstroScaffold({ projectRoot: nested, implementationRoot: 'frontend' });
  assert.equal(nestedAgain.created.length, 0, 'A second materialization must be idempotent.');
  assert(nestedAgain.unchanged.length > 0, 'A second materialization must recognize identical runtime files.');

  const unsafe = join(temp, 'unsafe-project');
  mkdirSync(join(unsafe, 'frontend'), { recursive: true });
  writeFileSync(join(unsafe, 'frontend', 'vite.config.ts'), 'export default {}\n');
  assert.throws(
    () => materializeAstroScaffold({ projectRoot: unsafe, implementationRoot: 'frontend' }),
    /not safely scaffoldable/,
  );
  assert(!existsSync(join(unsafe, 'frontend', 'package.json')), 'Failed scaffoldability must not write partial application files.');
  assert(!existsSync(join(unsafe, '.github', 'workflows', 'design-workflow-ui.yml')), 'Failed scaffoldability must not write repository integration.');

  const conflict = join(temp, 'conflict-project');
  mkdirSync(join(conflict, 'frontend'), { recursive: true });
  writeFileSync(join(conflict, 'frontend', 'package.json'), '{"name":"different"}\n');
  assert.throws(
    () => materializeAstroScaffold({ projectRoot: conflict, implementationRoot: 'frontend' }),
    /would overwrite existing project files/,
  );
  assert(!existsSync(join(conflict, 'frontend', 'src')), 'Conflict detection must complete before scaffold writes begin.');

  const revision = 'a'.repeat(40);
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

  const workflow = read(join(repo, '.github/workflows/design-workflow-ui.yml'));
  assert(workflow.includes('github.event.pull_request.head.sha || github.sha'), 'Validate the implementation commit, including PR heads.');
  assert(workflow.includes("working-directory: '.'"), 'Root scaffolds must render repository-aware working-directory configuration.');
  assert(workflow.includes('VALIDATION_RESULT') || workflow.includes('scripts/validation-report.mjs'));
  assert(workflow.includes('contents: read'));
  assert(!workflow.includes('__IMPLEMENTATION_'), 'Rendered validation workflow must not retain scaffold placeholders.');
  assert(!workflow.includes('pull_request_target'));
  assert(!workflow.includes('**.md'), 'Bookkeeping must not be presented as a UI validation trigger.');
  assert.deepEqual(readdirSync(repo).filter(name => name === 'node_modules'), []);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Astro runtime scaffold generation, Stage-10 remote command allowlist, nested-root rendering, conflict safety, idempotence, locked dependencies, and validation evidence passed.');
