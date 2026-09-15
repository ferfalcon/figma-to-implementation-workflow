#!/usr/bin/env node

import {
  cpSync,
  mkdirSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPathWithin } from './lib/path-safety.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scaffoldRoot = join(root, 'implementation-adapters', 'astro', 'scaffold');

function parseArgs(argv) {
  const options = {
    output: join(root, 'dist', 'astro-scaffold'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      if (!argv[index + 1]) throw new Error('--output requires a path.');
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function buildAstroScaffold({ output }) {
  const outputRoot = resolve(output);

  if (isPathWithin(outputRoot, root) || isPathWithin(scaffoldRoot, outputRoot)) {
    throw new Error('Scaffold output must not replace toolkit or adapter sources.');
  }
  if (isPathWithin(root, outputRoot) && (outputRoot === join(root, 'dist') || !isPathWithin(join(root, 'dist'), outputRoot))) {
    throw new Error('In-repository scaffold output must be under dist/.');
  }

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });

  const ignored = new Set([
    'node_modules',
    'dist',
    '.astro',
    '.vercel',
    'playwright-report',
    'test-results',
    'validation-result.json',
  ]);
  cpSync(scaffoldRoot, outputRoot, {
    recursive: true,
    filter: (path) => !path.slice(scaffoldRoot.length).split(/[\\/]/).some((part) => ignored.has(part)),
  });

  renameSync(join(outputRoot, 'package-lock.template.json'), join(outputRoot, 'package-lock.json'));
  renameSync(join(outputRoot, 'gitignore.template'), join(outputRoot, '.gitignore'));

  return { outputRoot };
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = buildAstroScaffold(options);
    console.log(`Astro implementation scaffold created at ${result.outputRoot}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
