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
import { isPathWithin } from './lib/path-safety.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const callerTemplatePath = join(root, 'templates', 'github', 'design-workflow-command.yml.template');
const projectInstructionsFilename = 'Project-settings--Instructions.md';
const projectInstructionsPath = join(root, projectInstructionsFilename);
const projectConfigTemplatePath = join(root, 'templates', 'design-workflow.config.template.json');

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

  if (isPathWithin(outputRoot, root)) {
    throw new Error('Bundle output must not replace toolkit sources.');
  }
  if (isPathWithin(root, outputRoot) && (outputRoot === join(root, 'dist') || !isPathWithin(join(root, 'dist'), outputRoot))) {
    throw new Error('In-repository bundle output must be under dist/.');
  }
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(workflowRoot, { recursive: true });

  const callerTemplate = readFileSync(callerTemplatePath, 'utf8');
  const caller = callerTemplate.replaceAll('<REMOTE_EXECUTOR_REVISION>', revision);
  if (caller.includes('<REMOTE_EXECUTOR_REVISION>')) {
    throw new Error('Remote executor placeholder remained unresolved in generated caller.');
  }
  writeFileSync(join(workflowRoot, 'design-workflow-command.yml'), caller);

  copyFileSync(projectInstructionsPath, join(outputRoot, projectInstructionsFilename));
  copyFileSync(projectConfigTemplatePath, join(outputRoot, 'design-workflow.config.template.json'));

  const manifest = {
    bundleFormatVersion: 5,
    starter: null,
    installationModel: 'external-pinned-toolkit',
    toolkitRepository,
    toolkitRevision: revision,
    repositoryUploadRoot: 'repository/',
    remoteCaller: 'repository/.github/workflows/design-workflow-command.yml',
    projectInstructions: projectInstructionsFilename,
    projectConfigTemplate: 'design-workflow.config.template.json',
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
