#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { observedRuntimeToolkitPin } from '../cli/lib/toolkit-binding.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = observedRuntimeToolkitPin();
const temporary = mkdtempSync(join(tmpdir(), 'design-workflow-packed-install-'));
const packageSource = join(temporary, 'toolkit-source');
const packageDirectory = join(temporary, 'package');
const consumer = join(temporary, 'consumer');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
  });
  if (result.status !== (options.status ?? 0)) {
    throw new Error([
      `Command failed: ${command} ${args.join(' ')}`,
      `Expected ${options.status ?? 0}, received ${result.status}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return result;
}

function git(cwd, args) {
  return run('git', args, cwd).stdout.trim();
}

try {
  assert(runtime?.repository && runtime?.revision, 'Packed-install test requires observable source toolkit provenance.');

  cpSync(root, packageSource, {
    recursive: true,
    filter(source) {
      const relative = source.slice(root.length).replaceAll('\\', '/').replace(/^\//, '');
      return relative !== '.git'
        && !relative.startsWith('.git/')
        && relative !== 'node_modules'
        && !relative.startsWith('node_modules/')
        && relative !== 'cli/toolkit-provenance.json';
    },
  });
  mkdirSync(packageDirectory, { recursive: true });
  mkdirSync(consumer, { recursive: true });

  const pack = run('npm', ['pack', '--json', '--pack-destination', packageDirectory], packageSource, {
    env: {
      DESIGN_WORKFLOW_TOOLKIT_REPOSITORY: runtime.repository,
      DESIGN_WORKFLOW_TOOLKIT_COMMIT: runtime.revision,
    },
  });
  const report = JSON.parse(pack.stdout)[0];
  const tarball = join(packageDirectory, report.filename);
  assert(existsSync(tarball), `npm pack did not create ${tarball}`);
  assert(!existsSync(join(packageSource, 'cli', 'toolkit-provenance.json')), 'postpack did not clean package-source provenance.');

  run('npm', ['init', '-y'], consumer);
  git(consumer, ['init']);
  git(consumer, ['config', 'user.email', 'consumer@example.com']);
  git(consumer, ['config', 'user.name', 'Consumer Fixture']);
  git(consumer, ['branch', '-M', 'main']);
  git(consumer, ['remote', 'add', 'origin', 'https://github.com/example/consumer-application.git']);
  writeFileSync(join(consumer, 'seed.txt'), 'consumer baseline\n', 'utf8');
  git(consumer, ['add', 'seed.txt', 'package.json']);
  git(consumer, ['commit', '-m', 'Create consumer baseline']);
  const consumerCommit = git(consumer, ['rev-parse', 'HEAD']).toLowerCase();

  run('npm', ['install', tarball, '--ignore-scripts'], consumer);
  const cli = join(
    consumer, 'node_modules', '@ferfalcon', 'design-workflow', 'cli', 'design-workflow.mjs',
  );
  assert(existsSync(cli), 'Packed toolkit CLI was not installed in the consumer project.');
  const installedRoot = resolve(dirname(cli), '..');

  for (const path of [
    'AGENTS-instructions.md',
    'Project-settings--Instructions.md',
    'workflow/Agent-Orchestration.md',
    'workflow/Implementation-Adapters.md',
    'workflow/Execution-Transports.md',
    'workflow/adapter-catalog.json',
    'prompts/00-intake.md',
    'templates/WORKPACK.template.md',
    'source-adapters/FIGMA.md',
    'implementation-adapters/ASTRO.md',
    'implementation-adapters/astro/scaffold/application/package.json',
    'implementation-adapters/astro/scaffold/application/package-lock.template.json',
    'implementation-adapters/astro/scaffold/repository/validate-ui.yml.template',
    'deployment-adapters/VERCEL.md',
    'schemas/workflow-record.schema.json',
    'cli/lib/implementation-cli.mjs',
    'cli/lib/implementation-scaffold.mjs',
  ]) {
    assert(existsSync(join(installedRoot, path)), `Packed runtime is missing ${path}.`);
  }
  for (const path of [
    'AGENTS-INIT.md',
    'examples',
    'scripts',
    'starters',
    'tests',
    'implementation-adapters/astro/scaffold/README.md',
  ]) {
    assert(!existsSync(join(installedRoot, path)), `Packed runtime must exclude source-only ${path}.`);
  }

  const help = run(process.execPath, [cli, 'help'], consumer);
  assert(help.stdout.includes('implementation scaffold astro-typescript'), 'Packed CLI help does not expose the Stage-10 Astro scaffold capability.');

  run(process.execPath, [cli, 'init', '--name', 'Packed consumer', '--profile', 'Express'], consumer);
  const record = JSON.parse(readFileSync(join(consumer, '.workflow', 'workflow-record.json'), 'utf8'));
  assert(record.toolkit?.repository === runtime.repository, 'Installed package inherited the consumer repository identity.');
  assert(record.toolkit?.revision === runtime.revision, 'Installed package inherited the consumer Git revision.');
  assert(record.toolkit.revision !== consumerCommit, 'Toolkit revision unexpectedly equals consumer HEAD.');

  writeFileSync(join(consumer, 'design-workflow.config.json'), `${JSON.stringify({
    schemaVersion: 2,
    project: { name: 'Packed consumer' },
    repository: {
      url: 'https://github.com/example/consumer-application',
      implementationRoot: 'frontend',
      workingBranch: 'main',
    },
    design: {
      provider: 'figma',
      url: 'https://www.figma.com/design/example',
      scope: 'Fixture',
    },
    deployment: { vercelProjectUrl: null, productionUrl: null },
    workflow: { reviewStyle: 'every-stage' },
  }, null, 2)}\n`);
  const earlyScaffold = run(process.execPath, [cli, 'implementation', 'scaffold', 'astro-typescript'], consumer, { status: 1 });
  assert(/Stage 10/i.test(earlyScaffold.stderr), 'Packed CLI did not fail closed when scaffolding outside Stage 10.');
  assert(!existsSync(join(consumer, 'frontend', 'package.json')), 'Rejected scaffold command wrote application files before Stage 10.');

  const contextResult = run(process.execPath, [cli, 'agent-context', '--json'], consumer);
  const context = JSON.parse(contextResult.stdout);
  assert(context.toolkit?.pinned === true, 'Installed package context did not expose a pinned toolkit.');
  assert(context.toolkit.repository === runtime.repository, 'Installed package context changed toolkit repository identity.');
  assert(context.toolkit.revision === runtime.revision, 'Installed package context changed toolkit revision identity.');
  assert(context.workflow?.valid === true, `Installed package context is invalid: ${(context.workflow?.findings ?? []).join('; ')}`);
  assert(context.resources?.stagePrompt?.resolution === 'embedded', 'Installed package did not trust its matching embedded provenance.');
  assert(
    typeof context.resources?.stagePrompt?.content === 'string' && context.resources.stagePrompt.content.length > 0,
    'Installed package could not embed the active stage prompt.',
  );
  const implementationGuidance = context.resources?.guidance?.find(
    (resource) => resource.path === 'workflow/Implementation-Adapters.md',
  );
  assert(
    implementationGuidance?.resolution === 'embedded' && typeof implementationGuidance.content === 'string'
      && implementationGuidance.content.length > 0,
    'Installed package could not embed required implementation-adapter guidance.',
  );

  console.log(`Packed runtime preserved toolkit provenance ${runtime.repository}#${runtime.revision}, packaged deterministic Astro scaffold resources, and enforced Stage-10 authorization inside unrelated consumer ${basename(consumer)}.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
