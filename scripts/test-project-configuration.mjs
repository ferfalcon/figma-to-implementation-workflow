#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { validateProjectConfiguration, readProjectConfiguration, resolveProjectSession, validWorkingBranch, PROJECT_CONFIGURATION_VERSION } from '../cli/lib/project-configuration.mjs';
import { PROJECT_CONFIGURATION_SCHEMA_VERSION } from '../cli/lib/contract-compatibility.mjs';
import { runCli } from '../cli/lib/workflow-cli.mjs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const errors = [];

const schema = JSON.parse(read('schemas/design-workflow-config.schema.json'));
const template = JSON.parse(read('templates/design-workflow.config.template.json'));
const contract = read('workflow/Project-Configuration.md');
const projectSettings = read('AI-project-settings.md');
const quickstart = read('QUICKSTART.md');
const bootstrap = read('AGENTS-instructions.md');
const orchestration = read('workflow/Agent-Orchestration.md');

function expect(condition, message) {
  if (!condition) errors.push(message);
}

expect(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'Project config schema must use JSON Schema draft 2020-12.');
expect(schema.additionalProperties === false, 'Project config root must reject unknown properties.');
expect(schema.properties?.schemaVersion?.const === 2, 'Project config schemaVersion must be exactly 2.');
for (const key of ['schemaVersion', 'project', 'repository', 'design', 'deployment']) {
  expect(schema.required?.includes(key), `Project config schema must require ${key}.`);
}
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
expect(schema.properties?.design?.properties?.provider?.const === 'figma', 'Project config v1 design provider must be figma.');
expect(schema.properties?.deployment?.required?.includes('vercelProjectUrl'), 'Deployment config must include vercelProjectUrl.');
expect(schema.properties?.deployment?.required?.includes('productionUrl'), 'Deployment config must include productionUrl.');

expect(template.schemaVersion === 2, 'Project config template must use schemaVersion 2.');
expect(template.project?.name === '<PROJECT_NAME>', 'Project config template must expose project name.');
expect(template.repository?.url === '<REPOSITORY_URL>', 'Project config template must expose repository URL.');
expect(template.repository?.implementationRoot === '<IMPLEMENTATION_ROOT>', 'Project config template must expose implementation root.');
expect(template.design?.provider === 'figma', 'Project config template must use Figma provider.');
expect(template.design?.url === '<FIGMA_URL>', 'Project config template must expose Figma URL.');
expect(template.design?.scope === '<FIGMA_SCOPE>', 'Project config template must expose Figma scope.');
expect(template.deployment?.vercelProjectUrl === null, 'Vercel project URL must default to null.');
expect(template.deployment?.productionUrl === null, 'Production URL must default to null.');

expect(contract.includes('canonical, version-controlled project configuration'), 'Project configuration contract must define canonical persistent authority.');
expect(contract.includes('only a bootstrap pointer'), 'Project configuration contract must distinguish the host repository locator from canonical configuration.');
expect(contract.includes('A configuration change after planning baseline is a real project change.'), 'Project configuration changes must remain impact-assessed project changes.');
expect(contract.includes('Do not store secrets'), 'Project configuration contract must prohibit secrets.');

expect(projectSettings.startsWith('# Project locator'), 'ChatGPT Project Instructions must start with the repository locator.');
expect(projectSettings.includes('- Repository: `<REPOSITORY_URL>`'), 'ChatGPT Project Instructions must retain the repository locator.');
expect(projectSettings.includes('design-workflow.config.json'), 'ChatGPT Project Instructions must load repository-owned project configuration.');
for (const placeholder of ['<PROJECT_NAME>', '<FIGMA_URL>', '<FIGMA_SCOPE>', '<IMPLEMENTATION_ROOT>', '<VERCEL_URL>', '<PRODUCTION_URL>']) {
  expect(!projectSettings.includes(placeholder), `ChatGPT Project Instructions must not duplicate ${placeholder}.`);
}

expect(quickstart.includes('ChatGPT reads or creates design-workflow.config.json'), 'Quickstart must include persistent project configuration in the setup test.');
expect(bootstrap.includes('design-workflow.config.json'), 'Consumer agent bootstrap must read project configuration.');
expect(orchestration.includes('design-workflow.config.json'), 'Agent orchestration must read project configuration before intake.');


assert.equal(PROJECT_CONFIGURATION_VERSION, PROJECT_CONFIGURATION_SCHEMA_VERSION);
assert.equal(JSON.parse(read('schemas/design-workflow-config.v1.schema.json')).properties.schemaVersion.const, 1);
assert.deepEqual(schema.properties.workflow.properties.reviewStyle.enum, ['brief-and-preview', 'every-stage']);
assert(schema.required.includes('workflow'));
assert(schema.properties.repository.required.includes('workingBranch'));
assert.equal(template.workflow.reviewStyle, '<REVIEW_STYLE>', 'Choose a preference; do not treat a default as consent.');

const config = {
  schemaVersion: 2,
  project: { name: 'Configuration fixture' },
  repository: { url: 'https://github.com/example/product', implementationRoot: '.', workingBranch: 'design/initial-ui' },
  design: { provider: 'figma', url: 'https://www.figma.com/design/file?node-id=1-2', scope: 'Home and About' },
  deployment: { vercelProjectUrl: null, productionUrl: null },
  workflow: { reviewStyle: 'brief-and-preview' },
};
const initial = structuredClone(config);
assert.deepEqual(validateProjectConfiguration(config), { valid: true, findings: [] });
assert.equal(resolveProjectSession(config).initialMode, 'Continuous documentation');
assert.equal(resolveProjectSession(config).workingBranch, 'design/initial-ui');
const resumed = resolveProjectSession(config, { currentRef: 'design/initial-ui', currentMode: 'Task-by-task' });
assert.equal(resumed.initialMode, 'Task-by-task', 'Resuming must preserve the approved execution mode.');
assert.deepEqual(config, initial, 'Settings resolution must not write executable state.');
assert.throws(() => resolveProjectSession(config, { currentRef: 'main' }), /explicit working ref/);
assert.throws(() => resolveProjectSession(config, { repositoryUrl: 'https://github.com/example/another' }), /identity mismatch/);
assert.equal(resolveProjectSession(config, { repositoryUrl: 'https://github.com/EXAMPLE/product.git/' }).workingBranch, 'design/initial-ui');
config.workflow.reviewStyle = 'every-stage';
assert.equal(resolveProjectSession(config).initialMode, 'Gated');
assert.equal(resolveProjectSession(config, { currentMode: 'Task-by-task' }).initialMode, 'Task-by-task', 'Preference changes must not silently mutate the active mode.');
config.workflow.reviewStyle = 'brief-and-preview';

const legacy = structuredClone(config);
legacy.schemaVersion = 1;
delete legacy.workflow;
delete legacy.repository.workingBranch;
legacy.deployment.productionUrl = 'http://localhost:4321';
assert(validateProjectConfiguration(legacy).valid, 'Legacy URI configuration must remain readable.');
for (const currentMode of ['Gated', 'Continuous documentation', 'Task-by-task']) {
  const session = resolveProjectSession(legacy, { currentRef: 'legacy/feature', currentMode });
  assert.equal(session.workingBranch, 'legacy/feature');
  assert.equal(session.initialMode, currentMode);
  assert.equal(session.reviewStyle, null);
  assert.equal(session.requiresAdoption, true);
}
assert.equal(resolveProjectSession(legacy).workingBranch, null, 'Unknown legacy working refs must not be guessed.');
assert.equal(resolveProjectSession(legacy, { defaultBranch: 'trunk' }).workingBranch, 'trunk');

for (const branch of ['design/initial-ui', 'feature_1', 'release/v1.2']) assert(validWorkingBranch(branch), branch);
for (const branch of ['', 'HEAD', 'refs/heads/main', '../main', 'foo//bar', 'foo.lock', 'foo/.hidden', 'foo/', 'main.', 'a'.repeat(40), 'x\nmain', 'a b']) assert(!validWorkingBranch(branch), branch);
for (const alter of [
  value => { value.schemaVersion = 3; },
  value => { value.workflow.reviewStyle = '<REVIEW_STYLE>'; },
  value => { value.workflow.progress = 'done'; },
  value => { delete value.repository.workingBranch; },
  value => { value.repository.implementationRoot = '../escape'; },
  value => { value.repository.implementationRoot = 'C:\\repo'; },
  value => { value.repository.url = 'https://github.com/other/product/issues'; },
  value => { value.design.url = 'https://example.com/design'; },
  value => { value.design.scope = '<FIGMA_SCOPE>'; },
  value => { value.deployment.productionUrl = 'http://localhost:4321'; },
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
  writeFileSync(path, JSON.stringify(config));
  assert.deepEqual(readProjectConfiguration(directory), config);
  const before = readFileSync(path, 'utf8');
  let output = '';
  const status = await runCli(['project', 'check', '--json'], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  });
  assert.equal(status, 0);
  assert.equal(JSON.parse(output).workingBranch, 'design/initial-ui');
  assert.equal(JSON.parse(output).verification, 'configuration-only');
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.deepEqual(readdirSync(directory), ['design-workflow.config.json'], 'Configuration checks must not initialize a workflow.');
  writeFileSync(path, '{"schemaVersion":3}');
  output = '';
  assert.equal(await runCli(['project', 'check', '--json'], {
    cwd: directory, stdout: { write: value => { output += value; } }, stderr: { write() {} },
  }), 1);
  assert.equal(JSON.parse(output).valid, false);
} finally {
  rmSync(directory, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error('Project configuration test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Project configuration test passed (repository-owned authority, schema/template contract, one host locator, and no duplicated project placeholders).');
}
