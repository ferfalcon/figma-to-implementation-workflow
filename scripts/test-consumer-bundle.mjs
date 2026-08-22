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
    'consumer-bundle-manifest.json',
    'repository/.github/workflows/design-workflow-command.yml',
    'repository/docs/implementation-workflow/AGENTS-instructions.md',
    'repository/docs/implementation-workflow/AGENTS-PROMPT-Figma-file-preparation.md',
    'repository/docs/implementation-workflow/workflow/Agent-Orchestration.md',
    'repository/docs/implementation-workflow/workflow/Workflow-Profiles.md',
    'repository/docs/implementation-workflow/source-adapters/FIGMA-PREPARATION.md',
    'repository/docs/implementation-workflow/cli/design-workflow.mjs',
  ];

  for (const path of requiredFiles) {
    if (!existsSync(join(output, path))) {
      errors.push(`Consumer bundle is missing ${path}.`);
    }
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
  if (manifest.bundleFormatVersion !== 1) {
    errors.push('Consumer bundle manifest must use bundleFormatVersion 1.');
  }
  if (manifest.toolkitRepository !== 'ferfalcon/figma-to-implementation-workflow') {
    errors.push('Consumer bundle manifest must identify the canonical toolkit repository.');
  }
  if (manifest.toolkitRevision !== revision) {
    errors.push('Consumer bundle manifest must identify the exact toolkit revision.');
  }

  const generatedInstructions = readFileSync(join(output, 'ChatGPT-Project-Instructions.md'), 'utf8');
  const canonicalInstructions = readFileSync(join(root, 'AI-project-settings.md'), 'utf8');
  if (generatedInstructions !== canonicalInstructions) {
    errors.push('Consumer bundle ChatGPT Project Instructions must be generated directly from AI-project-settings.md.');
  }

  const forbiddenVendoredFiles = [
    'repository/docs/implementation-workflow/AGENTS.md',
    'repository/docs/implementation-workflow/CONTRIBUTING.md',
    'repository/docs/implementation-workflow/README.md',
    'repository/docs/implementation-workflow/CHANGELOG.md',
    'repository/docs/implementation-workflow/scripts',
    'repository/docs/implementation-workflow/tests',
  ];
  for (const path of forbiddenVendoredFiles) {
    if (existsSync(join(output, path))) {
      errors.push(`Consumer bundle must not include toolkit-development-only path ${path}.`);
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
  console.log('Consumer bundle test passed (uploadable repository payload and ChatGPT Project Instructions are generated from canonical sources with an immutable executor pin).');
}
