#!/usr/bin/env node

import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const callerTemplatePath = join(root, 'templates', 'github', 'design-workflow-command.yml.template');
const projectInstructionsPath = join(root, 'AI-project-settings.md');

function parseArgs(argv) {
  const options = {
    output: join(root, 'dist', 'consumer-bundle'),
    revision: process.env.GITHUB_SHA ?? null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--revision') {
      options.revision = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!/^[0-9a-f]{40}$/i.test(options.revision ?? '')) {
    throw new Error('Consumer bundle revision must be an exact 40-character Git commit SHA. Pass --revision <sha> or set GITHUB_SHA.');
  }

  return options;
}

export function buildConsumerBundle({ output, revision }) {
  if (!/^[0-9a-f]{40}$/i.test(revision ?? '')) {
    throw new Error('Consumer bundle revision must be an exact 40-character Git commit SHA.');
  }

  const outputRoot = resolve(output);
  const repositoryRoot = join(outputRoot, 'repository');
  const workflowRoot = join(repositoryRoot, '.github', 'workflows');

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(workflowRoot, { recursive: true });

  const callerTemplate = readFileSync(callerTemplatePath, 'utf8');
  const caller = callerTemplate.replaceAll('<REMOTE_EXECUTOR_REVISION>', revision);
  if (caller.includes('<REMOTE_EXECUTOR_REVISION>')) {
    throw new Error('Remote executor placeholder remained unresolved in generated caller.');
  }
  writeFileSync(join(workflowRoot, 'design-workflow-command.yml'), caller);

  copyFileSync(projectInstructionsPath, join(outputRoot, 'ChatGPT-Project-Instructions.md'));

  const manifest = {
    bundleFormatVersion: 2,
    installationModel: 'external-pinned-toolkit',
    toolkitRepository,
    toolkitRevision: revision,
    repositoryUploadRoot: 'repository/',
    remoteCaller: 'repository/.github/workflows/design-workflow-command.yml',
    projectInstructions: 'ChatGPT-Project-Instructions.md',
  };
  writeFileSync(
    join(outputRoot, 'consumer-bundle-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  return {
    outputRoot,
    repositoryRoot,
    workflowRoot,
    revision,
  };
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = buildConsumerBundle(options);
    console.log(`Consumer bundle created at ${result.outputRoot}`);
    console.log(`Pinned toolkit revision: ${result.revision}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
