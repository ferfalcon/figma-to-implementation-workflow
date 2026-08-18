#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  taskCompletionGitFindings, taskStartGitFindings,
} from '../cli/lib/git-worktree-policy.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr}`);
  return result.stdout.trim();
}

const cwd = mkdtempSync(join(tmpdir(), 'design-workflow-git-policy-'));

try {
  git(cwd, ['init']);
  git(cwd, ['config', 'user.email', 'fixture@example.com']);
  git(cwd, ['config', 'user.name', 'Fixture']);
  git(cwd, ['branch', '-M', 'main']);
  writeFileSync(join(cwd, 'seed.txt'), 'baseline\n', 'utf8');
  git(cwd, ['add', 'seed.txt']);
  git(cwd, ['commit', '-m', 'Create baseline']);
  const baselineCommit = git(cwd, ['rev-parse', 'HEAD']);

  const recordPath = join(cwd, '.workflow', 'workflow-record.json');
  mkdirSync(join(cwd, '.workflow', 'generated'), { recursive: true });
  writeFileSync(recordPath, '{}\n', 'utf8');
  for (const name of [
    'WORKFLOW-STATUS.md', 'SOURCE-INDEX.md', 'ARTIFACT-INDEX.md', 'TASK-INDEX.md', 'TRACEABILITY.md',
  ]) {
    writeFileSync(join(cwd, '.workflow', 'generated', name), `${name}\n`, 'utf8');
  }
  writeFileSync(join(cwd, 'TASK.md'), '# Task narrative\n', 'utf8');

  const record = {
    snapshots: [{
      id: 'SRC-REPO-001', role: 'Input baseline', reference: cwd, commit: baselineCommit,
    }],
    artifacts: [{ id: 'ART-TASK-P01-T01', type: 'TASK', path: 'TASK.md', status: 'Draft' }],
  };
  const task = { id: 'P01-T01', baseline: 'SRC-REPO-001' };

  assert(
    taskStartGitFindings(recordPath, record, task).length === 0,
    'task start should allow dirty workflow-managed state and active narrative artifacts',
  );

  writeFileSync(join(cwd, 'uncommitted-start.js'), 'export const dirty = true;\n', 'utf8');
  const startFindings = taskStartGitFindings(recordPath, record, task);
  assert(
    startFindings.some((finding) => finding.includes('uncommitted-start.js')),
    'task start did not reject an uncommitted implementation-scope file',
  );
  rmSync(join(cwd, 'uncommitted-start.js'));

  writeFileSync(join(cwd, 'implementation.js'), 'export const implemented = true;\n', 'utf8');
  git(cwd, ['add', 'implementation.js']);
  git(cwd, ['commit', '-m', 'Implement fixture']);
  const implementationCommit = git(cwd, ['rev-parse', 'HEAD']);
  assert(
    taskCompletionGitFindings(recordPath, record, task, implementationCommit).length === 0,
    'task completion should allow workflow-managed dirtiness with a separate implementation commit',
  );

  writeFileSync(join(cwd, 'uncommitted-complete.js'), 'export const leftover = true;\n', 'utf8');
  const completionFindings = taskCompletionGitFindings(recordPath, record, task, implementationCommit);
  assert(
    completionFindings.some((finding) => finding.includes('uncommitted-complete.js')),
    'task completion did not reject leftover implementation-scope changes',
  );
  rmSync(join(cwd, 'uncommitted-complete.js'));

  git(cwd, ['add', '.workflow']);
  git(cwd, ['commit', '-m', 'Record workflow control state']);
  writeFileSync(recordPath, '{"state":"changed"}\n', 'utf8');
  writeFileSync(join(cwd, 'implementation-2.js'), 'export const mixed = true;\n', 'utf8');
  git(cwd, ['add', '.workflow/workflow-record.json', 'implementation-2.js']);
  git(cwd, ['commit', '-m', 'Mix implementation and workflow control']);
  const mixedCommit = git(cwd, ['rev-parse', 'HEAD']);
  const mixedFindings = taskCompletionGitFindings(recordPath, record, task, mixedCommit);
  assert(
    mixedFindings.some((finding) => finding.includes('workflow-managed files')),
    'task completion did not reject an implementation output commit that modifies workflow-managed files',
  );

  console.log('Git working-tree and implementation-output commit policy tests passed.');
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
