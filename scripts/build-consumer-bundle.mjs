#!/usr/bin/env node

import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const callerTemplatePath = join(root, 'templates', 'github', 'design-workflow-command.yml.template');
const projectInstructionsPath = join(root, 'AI-project-settings.md');
const starterRoot = join(root, 'starters', 'astro');
const projectConfigTemplatePath = join(root, 'templates', 'design-workflow.config.template.json');

function parseArgs(argv) {
  const options = {
    output: join(root, 'dist', 'consumer-bundle'),
    revision: process.env.GITHUB_SHA ?? null,
    starter: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--starter') {
      options.starter = argv[index + 1];
      if (options.starter !== 'astro') throw new Error('Only the astro starter is supported.');
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

export function buildConsumerBundle({ output, revision, starter = null }) {
  if (starter !== null && starter !== 'astro') throw new Error('Only the astro starter is supported.');
  if (!/^[0-9a-f]{40}$/i.test(revision ?? '')) {
    throw new Error('Consumer bundle revision must be an exact 40-character Git commit SHA.');
  }

  const outputRoot = resolve(output);
  const repositoryRoot = join(outputRoot, 'repository');
  const workflowRoot = join(repositoryRoot, '.github', 'workflows');

  if (outputRoot === root || root.startsWith(outputRoot + '/') || outputRoot === starterRoot || outputRoot.startsWith(starterRoot + '/')) {
    throw new Error('Bundle output must not replace toolkit sources.');
  }
  if (outputRoot.startsWith(root + '/') && !outputRoot.startsWith(join(root, 'dist') + '/')) {
    throw new Error('In-repository bundle output must be under dist/.');
  }
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(workflowRoot, { recursive: true });

  if (starter === 'astro') {
    const ignored = new Set(['node_modules', 'dist', '.astro', '.vercel', 'playwright-report', 'test-results', 'validation-result.json']);
    cpSync(starterRoot, repositoryRoot, {
      recursive: true,
      filter: (path) => !path.slice(starterRoot.length).split(/[\\/]/).some((part) => ignored.has(part)),
    });
    renameSync(join(repositoryRoot, 'package-lock.template.json'), join(repositoryRoot, 'package-lock.json'));
    renameSync(join(repositoryRoot, 'gitignore.template'), join(repositoryRoot, '.gitignore'));
    copyFileSync(join(root, 'LICENSE'), join(repositoryRoot, 'LICENSE'));
    const readmePath = join(repositoryRoot, 'README.md');
    writeFileSync(readmePath, readFileSync(readmePath, 'utf8').replaceAll('<TOOLKIT_REVISION>', revision));
    copyFileSync(projectInstructionsPath, join(repositoryRoot, 'ChatGPT-Project-Instructions.md'));
    copyFileSync(projectConfigTemplatePath, join(repositoryRoot, 'design-workflow.config.template.json'));

  }

  const callerTemplate = readFileSync(callerTemplatePath, 'utf8');
  const caller = callerTemplate.replaceAll('<REMOTE_EXECUTOR_REVISION>', revision);
  if (caller.includes('<REMOTE_EXECUTOR_REVISION>')) {
    throw new Error('Remote executor placeholder remained unresolved in generated caller.');
  }
  writeFileSync(join(workflowRoot, 'design-workflow-command.yml'), caller);

  copyFileSync(projectInstructionsPath, join(outputRoot, 'ChatGPT-Project-Instructions.md'));
  copyFileSync(projectConfigTemplatePath, join(outputRoot, 'design-workflow.config.template.json'));

  if (starter === 'astro') {
    const files = {};
    const walk = (directory, prefix = '') => {
      for (const item of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = prefix + item.name;
        if (item.isDirectory()) walk(join(directory, item.name), path + '/');
        else if (item.isFile()) {
          const bytes = readFileSync(join(directory, item.name));
          files[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
        } else throw new Error('Starter sources must contain regular files only.');
      }
    };
    walk(repositoryRoot);
    writeFileSync(join(repositoryRoot, '.starter-source.json'), JSON.stringify({
      schemaVersion: 1, toolkitRepository, toolkitRevision: revision, starter: 'astro', files,
    }, null, 2) + '\n');
  }

  const manifest = {
    bundleFormatVersion: 4,
    starter,
    installationModel: 'external-pinned-toolkit',
    toolkitRepository,
    toolkitRevision: revision,
    repositoryUploadRoot: 'repository/',
    remoteCaller: 'repository/.github/workflows/design-workflow-command.yml',
    projectInstructions: 'ChatGPT-Project-Instructions.md',
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
