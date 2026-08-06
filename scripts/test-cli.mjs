#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, '..');
const cli = join(root, 'cli', 'design-workflow.mjs');
const project = mkdtempSync(join(tmpdir(), 'design-workflow-cli-'));

function run(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: project,
    encoding: 'utf8',
  });
  if (result.status !== expectedStatus) {
    console.error(`Command failed: design-workflow ${args.join(' ')}`);
    console.error(`Expected status ${expectedStatus}, received ${result.status}`);
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }
  return result.stdout;
}

try {
  run([
    'init',
    '--name', 'CLI fixture',
    '--profile', 'Express',
    '--design', 'https://figma.example/design?node-id=41-22',
  ]);

  if (!existsSync(join(project, 'WORKPACK.md'))) {
    throw new Error('Express init did not generate WORKPACK.md');
  }
  if (!existsSync(join(project, '.workflow', 'workflow-record.json'))) {
    throw new Error('Express init did not generate the workflow record');
  }

  run([
    'snapshot', 'add',
    '--kind', 'repo',
    '--reference', 'CLI repository baseline',
    '--commit', '1111111111111111111111111111111111111111',
    '--activate',
  ]);

  run(['artifact', 'create', 'design'], 1);
  run([
    'task', 'create',
    '--title', 'Implement article preview card',
    '--references', 'REQ-FR-001,SPEC-BEH-001,AC-001',
  ]);

  if (existsSync(join(project, 'Phase-01--Task-01.md'))) {
    throw new Error('Express task creation must not generate a separate task file');
  }

  run(['task', 'start', 'P01-T01']);
  run([
    'task', 'complete', 'P01-T01',
    '--commit', '2222222222222222222222222222222222222222',
    '--check', 'Build=Node fixture completed successfully',
    '--check', 'Keyboard=manual keyboard fixture passed',
  ]);
  run(['validate']);

  const status = JSON.parse(run(['status', '--json']));
  if (!status.valid) throw new Error('Completed CLI fixture is not semantically valid');
  if (status.counts.completeTasks !== 1) throw new Error('CLI fixture did not complete exactly one task');
  if (status.state.latestOutput !== 'SRC-REPO-002') throw new Error('CLI did not record expected output lineage');

  const trace = run(['trace', 'REQ-FR-001']);
  if (!trace.includes('Task P01-T01')) throw new Error('Trace command did not report the task reference');

  const record = JSON.parse(readFileSync(join(project, '.workflow', 'workflow-record.json'), 'utf8'));
  if (record.artifacts.some((artifact) => artifact.type === 'TASK')) {
    throw new Error('Express record contains a forbidden TASK artifact');
  }
  if (record.tasks[0].validation.length !== 2) {
    throw new Error('Task completion did not retain validation evidence');
  }

  console.log('Workflow CLI tests passed.');
} finally {
  rmSync(project, { recursive: true, force: true });
}
