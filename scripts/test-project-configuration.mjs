#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  migrateProjectConfiguration,
  PROJECT_CONFIGURATION_VERSION,
  readProjectConfiguration,
  resolveProjectSession,
  validWorkingBranch,
  validateProjectConfiguration,
} from '../cli/lib/project-configuration.mjs';
import { PROJECT_CONFIGURATION_SCHEMA_VERSION } from '../cli/lib/contract-compatibility.mjs';
import { runCli } from '../cli/lib/workflow-cli.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const errors = [];

const schema = JSON.parse(read('schemas/design-workflow-config.schema.json'));
const schemaV2 = JSON.parse(read('schemas/design-workflow-config.v2.schema.json'));
const schemaV1 = JSON.parse(read('schemas/design-workflow-config.v1.schema.json'));
const template = JSON.parse(read('templates/design-workflow.config.template.json'));
const semanticContract = JSON.parse(read('workflow/semantic-contract.json'));
const contract = read('workflow/Project-Configuration.md');
const projectSettings = read('Project-settings--Instructions.md');
const bootstrap = read('AGENTS-instructions.md');
const orchestration = read('workflow/Agent-Orchestration.md');

function expect(condition, message) {
  if (!condition) errors.push(message);
}

expect(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'Project config schema must use JSON Schema draft 2020-12.');
expect(schema.additionalProperties === false, 'Project config root must reject unknown properties.');
expect(schema.properties?.schemaVersion?.const === 3, 'Current project config schemaVersion must be exactly 3.');
for (const key of ['schemaVersion', 'project', 'repository', 'design', 'deployment', 'workflow']) {
  expect(schema.required?.includes(key), `Project config schema must require ${key}.`);
}
expect(schemaV2.properties?.schemaVersion?.const === 2, 'The preserved v2 schema must remain version 2.');
expect(schemaV1.properties?.schemaVersion?.const === 1, 'The preserved v1 schema must remain version 1.');
expect(schema.properties?.repository?.additionalProperties === false, 'Repository config must reject unknown properties.');
expect(typeof schema.properties?.repository?.properties?.implementationRoot?.pattern === 'string', 'Implementation root must have a relative-path schema constraint.');
expect(schema.properties?.repository?.properties?.implementationRoot?.not?.pattern === '(^|/)\\.\\.(/|$)', 'Implementation root must reject parent-directory escapes.');
const implementationRootRule = schema.properties.repository.properties.implementationRoot;
const implementationRootPattern = new RegExp(implementationRootRule.pattern);
const implementationRootForbidden = new RegExp(implementationRootRule.not.pattern);
for (const candidate of ['.', 'frontend/', 'apps/web/', './apps/web']) {
  expect(implementationRootPattern.test(candidate) && !implementationRootForbidden.test(candidate), `Implementation root should accept ${candidate}.`);
}
for (const candidate of ['/frontend', '../frontend', 'apps/../web', 'C:\\repo']) {
  expect(!implementationRootPattern.test(candidate) || implementationRootForbidden.test(candidate), `Implementation root should reject ${candidate}.`);
}
expect(schema.properties?.design?.properties?.provider?.const === 'figma', 'Current design provider remains figma.');
expect(schema.properties?.deployment?.required?.includes('provider'), 'Deployment config must include provider.');
expect(schema.properties?.deployment?.required?.includes('projectUrl'), 'Deployment config must include projectUrl.');
expect(schema.properties?.deployment?.required?.includes('productionUrl'), 'Deployment config must include productionUrl.');
expect(!schema.properties?.deployment?.properties?.vercelProjectUrl, 'Current schema must not retain the Vercel-specific locator.');
expect(schemaV2.properties?.deployment?.required?.includes('vercelProjectUrl'), 'Legacy v2 schema must preserve vercelProjectUrl.');
expect(schema.properties?.deployment?.properties?.provider?.pattern === '^[a-z0-9]+(?:-[a-z0-9]+)*$', 'Deployment provider must be an adapter id, not a provider enum baked into the schema.');

expect(template.schemaVersion === 3, 'Project config template must use schemaVersion 3.');
expect(template.project?.name === '<PROJECT_NAME>', 'Project config template must expose project name.');
expect(template.repository?.url === '<REPOSITORY_URL>', 'Project config template must expose repository URL.');
expect(template.repository?.implementationRoot === '<IMPLEMENTATION_ROOT>', 'Project config template must expose implementation root.');
expect(template.design?.provider === 'figma', 'Project config template must use Figma provider.');
expect(template.design?.url === '<FIGMA_URL>', 'Project config template must expose Figma URL.');
expect(template.design?.scope === '<FIGMA_SCOPE>', 'Project config template must expose Figma scope.');
expect(template.deployment?.provider === null, 'Deployment provider must default to null.');
expect(template.deployment?.projectUrl === null, 'Deployment project URL must default to null.');
expect(template.deployment?.productionUrl === null, 'Production URL must default to null.');
expect(template.workflow.reviewStyle === '<REVIEW_STYLE>', 'Choose a preference; do not treat a default as consent.');

expect(contract.includes('canonical, version-controlled project configuration'), 'Project configuration contract must define canonical persistent authority.');
expect(contract.includes('only a bootstrap pointer'), 'Project configuration contract must distinguish the host repository locator from canonical configuration.');
expect(contract.includes('A configuration change after planning baseline is a real project change.'), 'Project configuration changes must remain impact-assessed project changes.');
expect(contract.includes('Do not store secrets'), 'Project configuration contract must prohibit secrets.');
expect(contract.includes('design-workflow project migrate --to 3'), 'Project configuration contract must document the v3 migration command.');

expect(projectSettings.startsWith('# Project locator'), 'ChatGPT Project Instructions must start with the repository locator.');
expect(projectSettings.includes('- Repository: `<REPOSITORY_URL>`'), 'ChatGPT Project Instructions must retain the repository locator.');
expect(projectSettings.includes('design-workflow.config.json'), 'ChatGPT Project Instructions must load repository-owned project configuration.');
for (const placeholder of ['<PROJECT_NAME>', '<FIGMA_URL>', '<FIGMA_SCOPE>', '<IMPLEMENTATION_ROOT>', '<VERCEL_URL>', '<PRODUCTION_URL>']) {
  expect(!projectSettings.includes(placeholder), `ChatGPT Project Instructions must not duplicate ${placeholder}.`);
}

const requiredInitialInputs = semanticContract.productModel?.bootstrap?.requiredInitialInputs ?? [];
expect(requiredInitialInputs.length === 1 && requiredInitialInputs[0]?.id === 'repository-url', 'Semantic product model must define repository URL as the sole required initial input.');
expect(requiredInitialInputs[0]?.host === 'Project-settings--Instructions.md', 'Semantic product model must bind repository bootstrap to the canonical Project Instructions artifact.');
expect(requiredInitialInputs[0]?.placeholder === '<REPOSITORY_URL>', 'Semantic product model must bind repository bootstrap to the repository locator placeholder.');
expect(bootstrap.includes('design-workflow.config.json'), 'Consumer agent bootstrap must read project configuration.');
expect(orchestration.includes('design-workflow.config.json'), 'Agent orchestration must read project configuration before intake.');

assert.equal(PROJECT_CONFIGURATION_VERSION, PROJECT_CONFIGURATION_SCHEMA_VERSION);
assert.deepEqual(schema.properties.workflow.properties.reviewStyle.enum, ['brief-and-final', 'every-stage']);
assert.deepEqual(schemaV2.properties.workflow.properties.reviewStyle.enum, ['brief-and-preview', 'every-stage']);
assert(schema.properties.repository.required.includes('workingBranch'));

const config = {
  schemaVersion: 3,
  project: { name: 'Configuration fixture' },
  repository: { url: 'https://github.com/example/product', implementationRoot: '.', workingBranch: 'design/initial-ui' },
  design: { provider: 'figma', url: 'https://www.figma.com/design/file?node-id=1-2', scope: 'Home and About' },
  deployment: { provider: null, projectUrl: null, productionUrl: null },
  workflow: { reviewStyle: 'brief-and-final' },
};
const initial = structuredClone(config);
assert.deepEqual(validateProjectConfiguration(config), { valid: true, findings: [] });
assert.equal(resolveProjectSession(config).initialMode, 'Continuous documentation');
assert.equal(resolveProjectSession(config).workingBranch, 'design/initial-ui');
assert.equal(resolveProjectSession(config).requiresMigration, false);
assert.equal(resolveProjectSession(config).requiresAdoption, false);
const resumed = resolveProjectSession(config, { currentRef: 'design/initial-ui', currentMode: 'Task-by-task' });
assert.equal(resumed.initialMode, 'Task-by-task', 'Resuming must preserve the approved execution mode.');
assert.deepEqual(config, initial, 'Settings resolution must not write executable state.');
assert.throws(() => resolveProjectSession(config, { currentRef: 'main' }), /explicit working ref/);
assert.throws(() => resolveProjectSession(config, { repositoryUrl: 'https://github.com/example/another' }), /identity mismatch/);
assert.equal(resolveProjectSession(config, { repositoryUrl: 'https://github.com/EXAMPLE/product.git/' }).workingBranch, 'design/initial-ui');
config.workflow.reviewStyle = 'every-stage';
assert.equal(resolveProjectSession(config).initialMode, 'Gated');
assert.equal(resolveProjectSession(config, { currentMode: 'Task-by-task' }).initialMode, 'Task-by-task', 'Preference changes must not silently mutate the active mode.');
config.workflow.reviewStyle = 'brief-and-final';

const v2 = {
  schemaVersion: 2,
  project: { name: 'Configuration fixture' },
  repository: { url: 'https://github.com/example/product', implementationRoot: '.', workingBranch: 'design/initial-ui' },
  design: { provider: 'figma', url: 'https://www.figma.com/design/file?node-id=1-2', scope: 'Home and About' },
  deployment: { vercelProjectUrl: 'https://vercel.com/example/product', productionUrl: 'https://product.example.com' },
  workflow: { reviewStyle: 'brief-and-preview' },
};
assert(validateProjectConfiguration(v2).valid, 'Configuration v2 must remain readable.');
const v2Session = resolveProjectSession(v2);
assert.equal(v2Session.reviewStyle, 'brief-and-final', 'Legacy brief-and-preview must normalize to the current human-facing semantic identifier.');
assert.equal(v2Session.initialMode, 'Continuous documentation');
assert.equal(v2Session.requiresMigration, true);
assert.equal(v2Session.requiresAdoption, false);
const migratedV2 = migrateProjectConfiguration(v2);
assert.equal(migratedV2.changed, true);
assert.equal(migratedV2.fromVersion, 2);
assert.equal(migratedV2.toVersion, 3);
assert.deepEqual(migratedV2.config.deployment, {
  provider: 'vercel',
  projectUrl: 'https://vercel.com/example/product',
  productionUrl: 'https://product.example.com',
});
assert.equal(migratedV2.config.workflow.reviewStyle, 'brief-and-final');
assert(validateProjectConfiguration(migratedV2.config).valid);
assert.deepEqual(migrateProjectConfiguration(migratedV2.config), {
  changed: false,
  fromVersion: 3,
  toVersion: 3,
  config: migratedV2.config,
});

const v2WithoutDeployment = structuredClone(v2);
v2WithoutDeployment.deployment = { vercelProjectUrl: null, productionUrl: null };
assert.deepEqual(migrateProjectConfiguration(v2WithoutDeployment).config.deployment, {
  provider: null,
  projectUrl: null,
  productionUrl: null,
});

const legacy = structuredClone(v2);
legacy.schemaVersion = 1;
delete legacy.workflow;
delete legacy.repository.workingBranch;
legacy.deployment = { vercelProjectUrl: null, productionUrl: 'http://localhost:4321' };
assert(validateProjectConfiguration(legacy).valid, 'Legacy URI configuration must remain readable.');
for (const currentMode of ['Gated', 'Continuous documentation', 'Task-by-task']) {
  const session = resolveProjectSession(legacy, { currentRef: 'legacy/feature', currentMode });
  assert.equal(session.workingBranch, 'legacy/feature');
  assert.equal(session.initialMode, currentMode);
  assert.equal(session.reviewStyle, null);
  assert.equal(session.requiresAdoption, true);
  assert.equal(session.requiresMigration, false);
}
assert.throws(() => migrateProjectConfiguration(legacy), /--working-branch/);
const migratableV1 = structuredClone(legacy);
migratableV1.deployment.productionUrl = null;
const migratedV1 = migrateProjectConfiguration(migratableV1, {
  workingBranch: 'legacy/feature',
  reviewStyle: 'every-stage',
});
assert.equal(migratedV1.config.schemaVersion, 3);
assert.equal(migratedV1.config.repository.workingBranch, 'legacy/feature');
assert.equal(migratedV1.config.workflow.reviewStyle, 'every-stage');
assert.deepEqual(migratedV1.config.deployment, { provider: null, projectUrl: null, productionUrl: null });
assert.equal(resolveProjectSession(legacy).workingBranch, null, 'Unknown legacy working refs must not be guessed.');
assert.equal(resolveProjectSession(legacy, { defaultBranch: 'trunk' }).workingBranch, 'trunk');

const vercelConfig = structuredClone(config);
vercelConfig.deployment = {
  provider: 'vercel',
  projectUrl: 'https://vercel.com/example/product',
  productionUrl: 'https://product.example.com',
};
assert(validateProjectConfiguration(vercelConfig).valid, 'Registered deployment adapters must be accepted without baking provider names into the JSON schema.');

for (const branch of ['design/initial-ui', 'feature_1', 'release/v1.2']) assert(validWorkingBranch(branch), branch);
for (const branch of ['', 'HEAD', 'refs/heads/main', '../main', 'foo//bar', 'foo.lock', 'foo/.hidden', 'foo/', 'main.', 'a'.repeat(40), 'x\nmain', 'a b']) assert(!validWorkingBranch(branch), branch);
for (const alter of [
  value => { value.schemaVersion = 4; },
  value => { value.workflow.reviewStyle = 'brief-and-preview'; },
  value => { value.workflow.progress = 'done'; },
  value => { delete value.repository.workingBranch; },
  value => { value.repository.implementationRoot = '../escape'; },
  value => { value.repository.implementationRoot = 'C:\\repo'; },
  value => { value.repository.url = 'https://github.com/other/product/issues'; },
  value => { value.design.url = 'https://example.com/design'; },
  value => { value.design.scope = '<FIGMA_SCOPE>'; },
  value => { value.deployment.provider = 'unknown-provider'; value.deployment.projectUrl = 'https://example.com/project'; },
  value => { value.deployment.provider = 'vercel'; value.deployment.projectUrl = null; },
  value => { value.deployment.provider = null; value.deployment.projectUrl = 'https://vercel.com/example/product'; },
  value => { value.deployment.productionUrl = 'http://localhost:4321'; },
  value => { value.deployment.vercelProjectUrl = null; },
  value => { value.state = { stage: 10 }; },
]) {
  const invalid = structuredClone(config);
  alter(invalid);
  assert(!validateProjectConfiguration(invalid).valid, JSON.stringify(invalid));
  assert.throws(() => resolveProjectSession(invalid));
}
assert(!validateProjectConfiguration(template).valid, 'Unresolved setup templates must not pass.');
assert(!validateProjectConfiguration(null).valid);

const directory = mkdtempSync(join(tmpdir(), 'project-configuration-'));
try {
  const path = join(directory, 'design-workflow.config.json');
  writeFileSync(path, JSON.stringify(v2));
  let output = '';
  let status = await runCli(['project', 'migrate', '--to', '3', '--json'], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  });
  assert.equal(status, 0);
  const migrationReport = JSON.parse(output);
  assert.equal(migrationReport.changed, true);
  assert.equal(migrationReport.fromVersion, 2);
  assert.equal(migrationReport.toVersion, 3);
  const onDisk = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(onDisk, migratedV2.config, 'CLI migration must persist the deterministic v2 -> v3 result.');

  const migratedBytes = readFileSync(path, 'utf8');
  output = '';
  status = await runCli(['project', 'migrate', '--to', '3', '--json'], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  });
  assert.equal(status, 0);
  assert.equal(JSON.parse(output).changed, false, 'Current configuration migration must be idempotent.');
  assert.equal(readFileSync(path, 'utf8'), migratedBytes, 'Idempotent migration must not rewrite current configuration.');

  output = '';
  status = await runCli(['project', 'check', '--json'], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  });
  assert.equal(status, 0);
  assert.equal(JSON.parse(output).schemaVersion, 3);
  assert.equal(JSON.parse(output).reviewStyle, 'brief-and-final');
  assert.equal(JSON.parse(output).verification, 'configuration-only');
  assert.deepEqual(readdirSync(directory), ['design-workflow.config.json'], 'Configuration commands must not initialize a workflow.');

  writeFileSync(path, JSON.stringify(migratableV1));
  let stderr = '';
  status = await runCli(['project', 'migrate', '--to', '3'], {
    cwd: directory, stdout: { write() {} }, stderr: { write: value => { stderr += value; } },
  });
  assert.equal(status, 1);
  assert.match(stderr, /--working-branch/);
  assert.equal(JSON.parse(readFileSync(path, 'utf8')).schemaVersion, 1, 'Failed adoption must leave v1 configuration untouched.');

  output = '';
  status = await runCli([
    'project', 'migrate', '--to', '3', '--working-branch', 'legacy/feature', '--review-style', 'every-stage', '--json',
  ], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  });
  assert.equal(status, 0);
  assert.equal(JSON.parse(output).changed, true);
  assert.equal(JSON.parse(readFileSync(path, 'utf8')).schemaVersion, 3);
} finally {
  rmSync(directory, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error('Project configuration test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Project configuration tests passed (v3 provider-neutral identity, review-style rename, deterministic v2 migration, explicit v1 adoption, and repository-owned authority).');
}
