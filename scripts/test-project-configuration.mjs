#!/usr/bin/env node

import { readFileSync } from 'node:fs';
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
expect(schema.properties?.schemaVersion?.const === 1, 'Project config schemaVersion must be exactly 1.');
for (const key of ['schemaVersion', 'project', 'repository', 'design', 'deployment']) {
  expect(schema.required?.includes(key), `Project config schema must require ${key}.`);
}
expect(schema.properties?.repository?.additionalProperties === false, 'Repository config must reject unknown properties.');
expect(typeof schema.properties?.repository?.properties?.implementationRoot?.pattern === 'string', 'Implementation root must have a relative-path schema constraint.');
expect(schema.properties?.repository?.properties?.implementationRoot?.not?.pattern === '(^|/)\\.\\.(/|$)', 'Implementation root must reject parent-directory escapes.');
expect(schema.properties?.design?.properties?.provider?.const === 'figma', 'Project config v1 design provider must be figma.');
expect(schema.properties?.deployment?.required?.includes('vercelProjectUrl'), 'Deployment config must include vercelProjectUrl.');
expect(schema.properties?.deployment?.required?.includes('productionUrl'), 'Deployment config must include productionUrl.');

expect(template.schemaVersion === 1, 'Project config template must use schemaVersion 1.');
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

if (errors.length > 0) {
  console.error('Project configuration test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Project configuration test passed (repository-owned authority, schema/template contract, one host locator, and no duplicated project placeholders).');
}
