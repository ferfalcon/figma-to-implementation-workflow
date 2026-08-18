#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  canonicalRepositoryReference, resolveRepositoryWorkspace,
} from '../cli/lib/repository-binding.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr}`);
  return result.stdout.trim();
}

const cwd = mkdtempSync(join(tmpdir(), 'design-workflow-binding-'));
const recordPath = join(cwd, '.workflow', 'workflow-record.json');

try {
  git(cwd, ['init']);
  git(cwd, ['config', 'user.email', 'fixture@example.com']);
  git(cwd, ['config', 'user.name', 'Fixture']);
  writeFileSync(join(cwd, 'seed.txt'), 'baseline\n', 'utf8');
  git(cwd, ['add', 'seed.txt']);
  git(cwd, ['commit', '-m', 'Create baseline']);
  const commit = git(cwd, ['rev-parse', 'HEAD']);
  const remote = 'https://github.com/example/design-project.git';
  git(cwd, ['remote', 'add', 'origin', remote]);
  mkdirSync(join(cwd, '.workflow'), { recursive: true });

  assert(
    canonicalRepositoryReference(cwd, cwd) === remote,
    'Repository initialization did not prefer the portable origin identity.',
  );

  const remoteSnapshot = {
    id: 'SRC-REPO-001', reference: remote, commit,
  };
  const remoteBinding = resolveRepositoryWorkspace(recordPath, remoteSnapshot, { cwd });
  assert(remoteBinding.repository === cwd, 'Remote repository identity did not bind to the current checkout.');

  const relativeSnapshot = {
    id: 'SRC-REPO-002', reference: '.', commit,
  };
  const relativeBinding = resolveRepositoryWorkspace(recordPath, relativeSnapshot, { cwd });
  assert(relativeBinding.repository === cwd, 'Relative repository identity did not bind to the project checkout.');

  const legacySnapshot = {
    id: 'SRC-REPO-003', reference: '/old-machine/missing/project', commit,
  };
  const legacyBinding = resolveRepositoryWorkspace(recordPath, legacySnapshot, { cwd });
  assert(legacyBinding.repository === cwd, 'Legacy absolute-path snapshot could not rebind by commit identity.');

  console.log('Portable repository binding tests passed.');
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
