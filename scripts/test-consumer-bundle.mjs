#!/usr/bin/env node

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConsumerBundle } from './build-consumer-bundle.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = mkdtempSync(join(tmpdir(), 'design-workflow-consumer-'));
const output = join(tempRoot, 'bundle');
const revision = '0123456789abcdef0123456789abcdef01234567';
const errors = [];

try {
  buildConsumerBundle({ output, revision });

  const requiredFiles = [
    'ChatGPT-Project-Instructions.md',
    'design-workflow.config.template.json',
    'consumer-bundle-manifest.json',
    'repository/.github/workflows/design-workflow-command.yml',
  ];

  for (const path of requiredFiles) {
    if (!existsSync(join(output, path))) {
      errors.push(`Consumer bundle is missing ${path}.`);
    }
  }

  if (existsSync(join(output, 'repository/docs/implementation-workflow'))) {
    errors.push('Consumer bundle must not vendor the workflow toolkit into the implementation repository.');
  }

  const caller = readFileSync(
    join(output, 'repository/.github/workflows/design-workflow-command.yml'),
    'utf8',
  );
  if (caller.includes('<REMOTE_EXECUTOR_REVISION>')) {
    errors.push('Generated consumer caller must not contain an unresolved remote executor placeholder.');
  }
  if (!caller.includes(`@${revision}`)) {
    errors.push('Generated consumer caller must pin the exact requested toolkit revision.');
  }

  const manifest = JSON.parse(readFileSync(join(output, 'consumer-bundle-manifest.json'), 'utf8'));
  if (manifest.bundleFormatVersion !== 4) {
    errors.push('Consumer bundle manifest must use bundleFormatVersion 4.');
  }
  if (manifest.installationModel !== 'external-pinned-toolkit') {
    errors.push('Consumer bundle manifest must identify the external pinned toolkit installation model.');
  }
  if (manifest.toolkitRepository !== 'ferfalcon/figma-to-implementation-workflow') {
    errors.push('Consumer bundle manifest must identify the canonical toolkit repository.');
  }
  if (manifest.toolkitRevision !== revision) {
    errors.push('Consumer bundle manifest must identify the exact toolkit revision.');
  }
  if (manifest.remoteCaller !== 'repository/.github/workflows/design-workflow-command.yml') {
    errors.push('Consumer bundle manifest must identify the thin GitHub remote caller.');
  }
  if (manifest.projectConfigTemplate !== 'design-workflow.config.template.json') {
    errors.push('Consumer bundle manifest must identify the project configuration template.');
  }

  const generatedTemplate = readFileSync(join(output, 'design-workflow.config.template.json'), 'utf8');
  const canonicalTemplate = readFileSync(join(root, 'templates/design-workflow.config.template.json'), 'utf8');
  if (generatedTemplate !== canonicalTemplate) {
    errors.push('Consumer bundle project configuration template must match the canonical template.');
  }

  const generatedInstructions = readFileSync(join(output, 'ChatGPT-Project-Instructions.md'), 'utf8');
  const canonicalInstructions = readFileSync(join(root, 'AI-project-settings.md'), 'utf8');
  if (generatedInstructions !== canonicalInstructions) {
    errors.push('Consumer bundle ChatGPT Project Instructions must be generated directly from AI-project-settings.md.');
  }
  if (generatedInstructions.includes('docs/implementation-workflow/AGENTS-instructions.md')) {
    errors.push('Consumer Project Instructions must not require a vendored workflow bootstrap.');
  }
  if (!generatedInstructions.includes('ferfalcon/figma-to-implementation-workflow')) {
    errors.push('Consumer Project Instructions must identify the canonical external toolkit repository.');
  }
  if (!generatedInstructions.includes('design-workflow.config.json')) {
    errors.push('Consumer Project Instructions must load repository-owned project configuration.');
  }
  if (!generatedInstructions.includes('<REPOSITORY_URL>')) {
    errors.push('Consumer Project Instructions must retain the repository bootstrap locator.');
  }
  for (const placeholder of ['<PROJECT_NAME>', '<FIGMA_URL>', '<FIGMA_SCOPE>', '<IMPLEMENTATION_ROOT>', '<VERCEL_URL>', '<PRODUCTION_URL>']) {
    if (generatedInstructions.includes(placeholder)) {
      errors.push(`Consumer Project Instructions must not duplicate project configuration placeholder ${placeholder}.`);
    }
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error('Consumer bundle test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Consumer bundle test passed (thin bootstrap, repository-owned project configuration template, canonical Project Instructions, and immutable toolkit pin).');
}
