import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { GENERATED_STATE_DIRECTORY, GENERATED_STATE_FILES } from './generated-state.mjs';
import { resolveRepositoryWorkspace } from './repository-binding.mjs';

const FULL_COMMIT = /^[0-9a-f]{40}$/i;

function gitRaw(repository, args) {
  try {
    return execFileSync('git', ['-C', repository, ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function normalizeRepositoryPath(path) {
  return String(path).replaceAll('\\', '/').replace(/^\.\//, '');
}

function repositoryRelativePath(repository, path) {
  const value = normalizeRepositoryPath(relative(repository, resolve(path)));
  if (!value || value === '..' || value.startsWith('../') || isAbsolute(value)) return null;
  return value;
}

export function workflowControlPaths(recordPath, repository) {
  const control = [
    resolve(recordPath),
    ...GENERATED_STATE_FILES.map((file) => resolve(
      dirname(recordPath), GENERATED_STATE_DIRECTORY, file,
    )),
  ];
  return new Set(control.map((path) => repositoryRelativePath(repository, path)).filter(Boolean));
}

export function workflowPlanningPaths(recordPath, record, repository) {
  const paths = workflowControlPaths(recordPath, repository);
  const projectRoot = resolve(dirname(recordPath), '..');
  for (const artifact of record.artifacts ?? []) {
    if (artifact.status === 'Superseded' || !artifact.path) continue;
    const absolute = isAbsolute(artifact.path) ? artifact.path : resolve(projectRoot, artifact.path);
    const path = repositoryRelativePath(repository, absolute);
    if (path) paths.add(path);
  }
  return paths;
}

function parsePorcelainPaths(output) {
  if (!output) return [];
  const entries = output.split('\0');
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    const status = entry.slice(0, 2);
    const path = entry.slice(3);
    if (path) paths.push(normalizeRepositoryPath(path));
    if (status.includes('R') || status.includes('C')) {
      const original = entries[index + 1];
      if (original) paths.push(normalizeRepositoryPath(original));
      index += 1;
    }
  }
  return [...new Set(paths)];
}

function dirtyPaths(repository) {
  const output = gitRaw(repository, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (output === null) return null;
  return parsePorcelainPaths(output);
}

function commitPaths(repository, commit) {
  const output = gitRaw(repository, [
    'diff-tree', '--root', '-m', '--no-commit-id', '--name-only', '-r', '-z', commit,
  ]);
  if (output === null) return null;
  return [...new Set(output.split('\0').filter(Boolean).map(normalizeRepositoryPath))];
}

function rangePaths(repository, fromCommit, toCommit) {
  if (fromCommit === toCommit) return [];
  const output = gitRaw(repository, ['diff', '--name-only', '-z', fromCommit, toCommit]);
  if (output === null) return null;
  return [...new Set(output.split('\0').filter(Boolean).map(normalizeRepositoryPath))];
}

function repositorySnapshot(record, task) {
  return record.snapshots.find((item) => item.id === task?.baseline && item.id.startsWith('SRC-REPO-')) ?? null;
}

export function taskRepositoryBinding(recordPath, record, task, options = {}) {
  if (!task?.baseline) throw new Error('Task does not have a repository baseline.');
  const baseline = repositorySnapshot(record, task);
  if (!baseline) throw new Error(`Task baseline ${task.baseline} does not reference a repository snapshot.`);
  return resolveRepositoryWorkspace(recordPath, baseline, options);
}

function implementationDirtyFindings(recordPath, repository, action) {
  const dirty = dirtyPaths(repository);
  if (dirty === null) return [`Git working-tree state could not be inspected before ${action}.`];
  const control = workflowControlPaths(recordPath, repository);
  const implementation = dirty.filter((path) => !control.has(path));
  if (implementation.length === 0) return [];
  return [
    `Git working tree has uncommitted implementation-scope changes before ${action}: ${implementation.join(', ')}. `
      + 'Only the canonical workflow record and generated workflow views may remain dirty.',
  ];
}

export function taskStartGitFindings(recordPath, record, task, options = {}) {
  try {
    const binding = taskRepositoryBinding(recordPath, record, task, options);
    return implementationDirtyFindings(recordPath, binding.repository, 'task start');
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

export function taskStartCheckpointFindings(recordPath, record, repository, fromCommit, toCommit) {
  const paths = rangePaths(repository, fromCommit, toCommit);
  if (paths === null) return ['Could not inspect committed repository changes before task start.'];
  const allowed = workflowPlanningPaths(recordPath, record, repository);
  const unexpected = paths.filter((path) => !allowed.has(path));
  if (unexpected.length === 0) return [];
  return [
    `Repository changes since ${fromCommit} include implementation-scope paths before task start: ${unexpected.join(', ')}. `
      + 'Review and record those upstream changes before starting the task.',
  ];
}

export function taskCompletionGitFindings(recordPath, record, task, commit, options = {}) {
  let binding;
  try {
    binding = taskRepositoryBinding(recordPath, record, task, options);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
  const findings = implementationDirtyFindings(recordPath, binding.repository, 'task completion');
  if (!FULL_COMMIT.test(String(commit ?? ''))) return findings;
  const paths = commitPaths(binding.repository, String(commit).toLowerCase());
  if (paths === null) return findings;
  const control = workflowControlPaths(recordPath, binding.repository);
  const mixed = paths.filter((path) => control.has(path));
  if (mixed.length > 0) {
    findings.push(
      `Implementation output commit ${String(commit).toLowerCase()} modifies workflow-control files: ${mixed.join(', ')}. `
        + 'Record implementation work in a separate commit and commit workflow-control state separately.',
    );
  }
  return findings;
}
