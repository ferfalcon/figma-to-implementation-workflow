#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const readme = read('README.md');
const projectSettings = read('AI-project-settings.md');
const toolkitAgents = read('AGENTS.md');
const consumerAgents = read('AGENTS-instructions.md');
const figmaLauncher = read('AGENTS-PROMPT-Figma-file-preparation.md');
const errors = [];

const requiredReadmeLinks = [
  'QUICKSTART.md',
  'workflow/Design-Implementation-Workflow.md',
  'AGENTS-instructions.md',
  'AI-project-settings.md',
  'AGENTS-PROMPT-Figma-file-preparation.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'cli/README.md',
  'schemas/README.md',
];

if (!readme.includes('## Choose your entry point')) {
  errors.push('README must route users through a role-based "Choose your entry point" section.');
}

for (const target of requiredReadmeLinks) {
  if (!readme.includes(`](${target})`)) {
    errors.push(`README entry-point discovery is missing ${target}.`);
  }
}

const delegatedReadmeHeadings = [
  'Source snapshots',
  'Workflow profiles',
  'Execution modes',
  'Ownership summary',
  'Integrated quality',
  'Two-pass reviews',
];

for (const heading of delegatedReadmeHeadings) {
  if (new RegExp(`^##\\s+${heading}$`, 'im').test(readme)) {
    errors.push(`README must link to the canonical owner instead of redefining a "${heading}" handbook section.`);
  }
}

if (/design-workflow\s+agent-context\s+--json/i.test(readme)) {
  errors.push('README must not become the consumer-agent bootstrap; delegate agent-context protocol to AGENTS-instructions.md.');
}

if (!projectSettings.includes('docs/implementation-workflow/AGENTS-instructions.md')) {
  errors.push('ChatGPT Project settings must delegate workflow execution to the vendored consumer-agent bootstrap.');
}

if (!projectSettings.includes("These Project instructions define ChatGPT's environment, tool behavior, autonomy, and execution posture.")) {
  errors.push('ChatGPT Project settings must keep their host/tool boundary explicit.');
}

if (/workflow\/Agent-Orchestration\.md/.test(projectSettings)) {
  errors.push('ChatGPT Project settings must route through AGENTS-instructions.md rather than bypassing the consumer bootstrap.');
}

if (!toolkitAgents.includes('# Repository Guidelines')) {
  errors.push('AGENTS.md must remain the toolkit repository-development contract.');
}

if (!consumerAgents.includes('# Agent bootstrap contract')) {
  errors.push('AGENTS-instructions.md must remain the implementation-project consumer bootstrap.');
}

if (!figmaLauncher.includes('single normative procedure')) {
  errors.push('Figma preparation launcher must identify one canonical preparation owner.');
}

if (errors.length > 0) {
  console.error('Entrypoint authority test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Entrypoint authority test passed (root entry points remain role-specific and delegated).');
}
