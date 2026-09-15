#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  copyFileSync,
  cpSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAstroScaffold } from './build-astro-scaffold.mjs';
import { buildConsumerBundle } from './build-consumer-bundle.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolkitRepository = 'ferfalcon/figma-to-implementation-workflow';
const projectInstructionsFilename = 'Project-settings--Instructions.md';
const projectInstructionsPath = join(root, projectInstructionsFilename);
const projectConfigTemplatePath = join(root, 'templates', 'design-workflow.config.template.json');

function parseArgs(argv) {
  const options = {
    output: join(root, 'dist', 'astro-fixture'),
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
    throw new Error('Astro fixture revision must be an exact 40-character Git commit SHA. Pass --revision <sha> or set GITHUB_SHA.');
  }

  return options;
}

export function materializeAstroFixture({ output, revision }) {
  const result = buildConsumerBundle({ output, revision });
  const { outputRoot, repositoryRoot } = result;

  for (const path of [
    'consumer-bundle-manifest.json',
    projectInstructionsFilename,
    'design-workflow.config.template.json',
  ]) {
    rmSync(join(outputRoot, path), { force: true });
  }

  const scaffoldOutput = join(outputRoot, '.astro-scaffold');
  buildAstroScaffold({ output: scaffoldOutput });
  cpSync(scaffoldOutput, repositoryRoot, { recursive: true });
  rmSync(scaffoldOutput, { recursive: true, force: true });

  copyFileSync(join(root, 'LICENSE'), join(repositoryRoot, 'LICENSE'));

  const readmePath = join(repositoryRoot, 'README.md');
  writeFileSync(readmePath, readFileSync(readmePath, 'utf8').replaceAll('<TOOLKIT_REVISION>', revision));
  copyFileSync(projectInstructionsPath, join(repositoryRoot, projectInstructionsFilename));
  copyFileSync(projectConfigTemplatePath, join(repositoryRoot, 'design-workflow.config.template.json'));

  const files = {};
  const walk = (directory, prefix = '') => {
    for (const item of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = prefix + item.name;
      if (item.isDirectory()) walk(join(directory, item.name), `${path}/`);
      else if (item.isFile()) {
        const bytes = readFileSync(join(directory, item.name));
        files[path] = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      } else {
        throw new Error('Astro fixture sources must contain regular files only.');
      }
    }
  };
  walk(repositoryRoot);
  writeFileSync(join(repositoryRoot, '.starter-source.json'), `${JSON.stringify({
    schemaVersion: 1,
    toolkitRepository,
    toolkitRevision: revision,
    starter: 'astro',
    files,
  }, null, 2)}\n`);

  return result;
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = materializeAstroFixture(options);
    console.log(`Astro development fixture materialized at ${result.outputRoot}`);
    console.log(`Pinned toolkit revision: ${result.revision}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
