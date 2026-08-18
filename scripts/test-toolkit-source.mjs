#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toolkitPinFromRecord } from '../cli/lib/toolkit-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'cli', 'design-workflow.mjs');
const projects = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function project(name) {
  const path = mkdtempSync(join(tmpdir(), `design-workflow-toolkit-${name}-`));
  projects.push(path);
  return path;
}

function run(cwd, args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, TMPDIR: '/tmp' },
  });
  if (result.status !== expectedStatus) {
    throw new Error([
      `Command failed: design-workflow ${args.join(' ')}`,
      `Expected ${expectedStatus}, received ${result.status}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return result;
}

function record(cwd) {
  return JSON.parse(readFileSync(join(cwd, '.workflow', 'workflow-record.json'), 'utf8'));
}

const commitA = 'a'.repeat(40);
const commitB = 'b'.repeat(40);
const repository = 'ferfalcon/figma-to-implementation-workflow';

try {
  assert(toolkitPinFromRecord({ snapshots: [] }) === null, 'Existing unpinned schema-v2 records must remain readable.');

  const cwd = project('pinned');
  run(cwd, [
    'init', '--name', 'Toolkit fixture', '--profile', 'Express',
    '--toolkit-repository', repository,
    '--toolkit-version', '0.3.0',
    '--toolkit-commit', commitA,
  ]);

  let current = record(cwd);
  const pin = toolkitPinFromRecord(current);
  assert(pin, 'Initialization did not record a toolkit pin.');
  assert(pin.repository === repository, 'Toolkit repository was not preserved.');
  assert(pin.version === '0.3.0', 'Toolkit package version was not preserved.');
  assert(pin.commit === commitA, 'Toolkit commit was not preserved.');
  assert(pin.pinStrength === 'Immutable', 'Toolkit source must be immutable.');
  assert(pin.role === 'Supporting source', 'Toolkit source must use Supporting source role.');
  assert(pin.snapshot?.startsWith('SRC-DOC-'), 'Toolkit source must use a documentation-source snapshot ID.');
  assert(!current.state.activeInputs.includes(pin.snapshot), 'Toolkit source must not become a product implementation input.');

  const contextResult = run(cwd, ['context', '--json']);
  const context = JSON.parse(contextResult.stdout);
  assert(context.toolkit.pinned === true, 'Context did not expose the toolkit pin.');
  assert(context.toolkit.commit === commitA, 'Context toolkit commit is incorrect.');
  assert(context.execution.prompt === 'prompts/00-intake.md', 'Legacy prompt path changed unexpectedly.');
  assert(context.execution.promptSource?.repository === repository, 'Prompt source repository is not resolved.');
  assert(context.execution.promptSource?.version === '0.3.0', 'Prompt source version is not resolved.');
  assert(context.execution.promptSource?.commit === commitA, 'Prompt source commit is not resolved.');
  assert(context.execution.promptSource?.path === 'prompts/00-intake.md', 'Prompt source path is not resolved.');

  const show = JSON.parse(run(cwd, ['toolkit', 'show', '--json']).stdout);
  assert(show.pinned === true && show.commit === commitA, 'toolkit show did not report the recorded pin.');

  run(cwd, [
    'toolkit', 'pin', '--repository', repository, '--version', '0.3.0', '--commit', commitA,
  ]);
  current = record(cwd);
  assert(current.snapshots.filter((snapshot) => snapshot.reference?.startsWith('toolkit+github://')).length === 1, 'Re-pinning the same toolkit created duplicate source state.');

  const before = readFileSync(join(cwd, '.workflow', 'workflow-record.json'));
  run(cwd, [
    'toolkit', 'pin', '--repository', repository, '--version', '0.3.0', '--commit', commitB,
  ], 1);
  const after = readFileSync(join(cwd, '.workflow', 'workflow-record.json'));
  assert(Buffer.compare(before, after) === 0, 'Refusing a different toolkit pin must not mutate the workflow record.');

  const invalid = project('invalid');
  run(invalid, [
    'init', '--name', 'Invalid toolkit fixture', '--profile', 'Express', '--toolkit-commit', 'abc123',
  ], 1);
  assert(!existsSync(join(invalid, '.workflow', 'workflow-record.json')), 'Invalid explicit toolkit pin must fail before initialization mutates files.');

  console.log('Toolkit source pinning, context resolution, and backward-compatibility tests passed.');
} finally {
  for (const path of projects) rmSync(path, { recursive: true, force: true });
}
