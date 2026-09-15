#!/usr/bin/env node

import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAstroScaffold } from '../build-astro-scaffold.mjs';
import { isPathWithin } from './path-safety.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const callerTemplatePath = join(root, 'templates', 'github', 'design-workflow-command.yml.template');
const projectInstructionsFilename = 'Project-settings--Instructions.md';
const projectInstructionsPath = join(root, projectInstructionsFilename);
const projectConfigTemplatePath = join(root, 'templates', 'design-workflow.config.template.json');

function assertRevision(revision) {
  if (!/^[0-9a-f]{40}$/i.test(revision ?? '')) {
    throw new Error('Legacy Astro release bundle revision must be an exact 40-character Git commit SHA.');
  }
}

export function buildLegacyAstroReleaseBundle({ output, revision }) {
  assertRevision(revision);
  const outputRoot = resolve(output);
  const repositoryRoot = join(outputRoot, 'repository');
  const workflowRoot = join(repositoryRoot, '.github', 'workflows');

  if (isPathWithin(outputRoot, root)) {
    throw new Error('Legacy release output must not replace toolkit sources.');
  }
  if (isPathWithin(root, outputRoot) && (outputRoot === join(root, 'dist') || !isPathWithin(join(root, 'dist'), outputRoot))) {
    throw new Error('In-repository legacy release output must be under dist/.');
  }

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(workflowRoot, { recursive: true });
  buildAstroScaffold({ output: repositoryRoot });

  copyFileSync(join(root, 'LICENSE'), join(repositoryRoot, 'LICENSE'));
  copyFileSync(projectInstructionsPath, join(repositoryRoot, projectInstructionsFilename));
  copyFileSync(projectConfigTemplatePath, join(repositoryRoot, 'design-workflow.config.template.json'));

  const callerTemplate = readFileSync(callerTemplatePath, 'utf8');
  const caller = callerTemplate.replaceAll('<REMOTE_EXECUTOR_REVISION>', revision);
  if (caller.includes('<REMOTE_EXECUTOR_REVISION>')) {
    throw new Error('Remote executor placeholder remained unresolved in generated caller.');
  }
  writeFileSync(join(workflowRoot, 'design-workflow-command.yml'), caller);

  copyFileSync(projectInstructionsPath, join(outputRoot, projectInstructionsFilename));
  copyFileSync(projectConfigTemplatePath, join(outputRoot, 'design-workflow.config.template.json'));

  const files = {};
  const walk = (directory, prefix = '') => {
    for (const item of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = prefix + item.name;
      if (item.isDirectory()) walk(join(directory, item.name), path + '/');
      else if (item.isFile()) {
        const bytes = readFileSync(join(directory, item.name));
        files[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
      } else throw new Error('Legacy release sources must contain regular files only.');
    }
  };
  walk(repositoryRoot);
  writeFileSync(join(repositoryRoot, '.starter-source.json'), JSON.stringify({
    schemaVersion: 1,
    toolkitRepository,
    toolkitRevision: revision,
    starter: 'astro',
    files,
  }, null, 2) + '\n');

  const manifest = {
    bundleFormatVersion: 5,
    starter: 'astro',
    installationModel: 'external-pinned-toolkit',
    toolkitRepository,
    toolkitRevision: revision,
    repositoryUploadRoot: 'repository/',
    remoteCaller: 'repository/.github/workflows/design-workflow-command.yml',
    projectInstructions: projectInstructionsFilename,
    projectConfigTemplate: 'design-workflow.config.template.json',
  };
  writeFileSync(join(outputRoot, 'consumer-bundle-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  return { outputRoot, repositoryRoot, workflowRoot, revision };
}

function parseArgs(argv) {
  const options = {
    output: join(root, 'dist', 'legacy-astro-release-bundle'),
    revision: process.env.GITHUB_SHA ?? null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--output') {
      if (!argv[index + 1]) throw new Error('--output requires a path.');
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (argv[index] === '--revision') {
      options.revision = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argv[index]}`);
  }
  assertRevision(options.revision);
  return options;
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) {
  try {
    const result = buildLegacyAstroReleaseBundle(parseArgs(process.argv.slice(2)));
    console.log(`Legacy Astro release bundle created at ${result.outputRoot}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
