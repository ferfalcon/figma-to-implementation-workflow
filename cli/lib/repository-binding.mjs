import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

function git(repository, args) {
  try {
    return execFileSync('git', ['-C', repository, ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function gitSucceeds(repository, args) {
  try {
    execFileSync('git', ['-C', repository, ...args], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function remoteLike(reference) {
  return /^(?:https?:\/\/|ssh:\/\/|git:\/\/|git@)/i.test(String(reference ?? ''));
}

function normalizeRemote(reference) {
  const value = String(reference ?? '').trim()
    .replace(/^git@([^:]+):/i, '$1/')
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/$/, '');
  return value.toLowerCase();
}

function localCandidate(base, value) {
  if (!value || remoteLike(value)) return null;
  return isAbsolute(value) ? value : resolve(base, value);
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => resolve(value)))];
}

export function gitValue(repository, args) {
  return git(repository, args);
}

export function gitCommandSucceeds(repository, args) {
  return gitSucceeds(repository, args);
}

export function repositoryProjectRoot(recordPath) {
  return resolve(dirname(recordPath), '..');
}

export function canonicalRepositoryReference(projectRoot, repository) {
  const root = git(repository, ['rev-parse', '--show-toplevel']);
  if (!root) throw new Error(`Could not resolve a Git repository from ${repository}.`);
  const origin = git(root, ['config', '--get', 'remote.origin.url']);
  if (origin) return origin;
  const local = relative(resolve(projectRoot), resolve(root)).split('\\').join('/');
  if (local === '') return '.';
  if (local !== '..' && !local.startsWith('../') && !isAbsolute(local)) return local;
  return resolve(root);
}

export function sameRepositoryReference(left, right) {
  if (!left || !right) return false;
  if (remoteLike(left) && remoteLike(right)) return normalizeRemote(left) === normalizeRemote(right);
  return String(left) === String(right);
}

export function resolveRepositoryWorkspace(recordPath, snapshot, options = {}) {
  if (!snapshot) throw new Error('Repository snapshot is required to resolve a local workspace.');
  const projectRoot = repositoryProjectRoot(recordPath);
  const cwd = options.cwd ? resolve(options.cwd) : projectRoot;
  const override = options.repository
    ? (isAbsolute(options.repository) ? options.repository : resolve(cwd, options.repository))
    : null;
  const candidates = unique([
    override,
    localCandidate(projectRoot, snapshot.reference),
    cwd,
    projectRoot,
  ]);

  for (const candidate of candidates) {
    const root = git(candidate, ['rev-parse', '--show-toplevel']);
    if (!root) continue;
    if (snapshot.commit && !gitSucceeds(root, ['cat-file', '-e', `${snapshot.commit}^{commit}`])) continue;
    if (remoteLike(snapshot.reference)) {
      const origin = git(root, ['config', '--get', 'remote.origin.url']);
      if (origin && !sameRepositoryReference(origin, snapshot.reference)) continue;
    }
    return {
      repository: root,
      reference: snapshot.reference,
      commit: snapshot.commit ?? null,
    };
  }

  const hint = options.repository
    ? ` using --repository ${options.repository}`
    : '';
  throw new Error(
    `Could not bind repository snapshot ${snapshot.id} (${snapshot.reference}) to an accessible local Git checkout${hint}. `
    + 'Run the command from the project repository or pass --repository <path>.',
  );
}
