import { execFileSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

const LOCAL_BINDING_FILE = join('.workflow', 'local.json');

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

function slashPath(value) {
  return String(value).split('\\').join('/');
}

function isWindowsAbsolutePath(value) {
  return /^[A-Za-z]:[\\/]/.test(String(value ?? ''));
}

function absoluteFrom(base, value) {
  if (isAbsolute(value) || isWindowsAbsolutePath(value)) return value;
  return resolve(base, value);
}

function repositoryRoot(repository) {
  const root = git(repository, ['rev-parse', '--show-toplevel']);
  return root ? resolve(root) : null;
}

function stripGitSuffix(value) {
  return String(value).replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
}

function localBindingPath(projectRoot) {
  return resolve(projectRoot, LOCAL_BINDING_FILE);
}

function readLocalBindings(projectRoot) {
  const path = localBindingPath(projectRoot);
  if (!existsSync(path)) return { repositories: {} };
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Local repository binding file is invalid JSON: ${error.message}`);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Local repository binding file must contain a JSON object.');
  }
  const repositories = parsed.repositories ?? {};
  if (!repositories || typeof repositories !== 'object' || Array.isArray(repositories)) {
    throw new Error('Local repository binding file "repositories" must be an object.');
  }
  for (const [reference, path] of Object.entries(repositories)) {
    if (!reference.trim() || typeof path !== 'string' || !path.trim()) {
      throw new Error('Local repository bindings must map non-empty references to non-empty paths.');
    }
  }
  return { repositories };
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

export function canonicalRemoteReference(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  if (isAbsolute(input) || isWindowsAbsolutePath(input) || input.startsWith('project://')) return null;

  if (!input.includes('://')) {
    const scpLike = /^(?:[^@/\s]+@)?([^:/\s]+):(.+)$/.exec(input);
    if (!scpLike) return null;
    const host = scpLike[1].toLowerCase();
    const path = stripGitSuffix(scpLike[2]);
    return host && path ? `https://${host}/${path}` : null;
  }

  try {
    const url = new URL(input);
    if (url.protocol === 'file:' || !url.host) return null;
    const path = stripGitSuffix(url.pathname);
    return path ? `https://${url.host.toLowerCase()}/${path}` : null;
  } catch {
    return null;
  }
}

function repositoryRemoteReference(repository) {
  let remote = git(repository, ['config', '--get', 'remote.origin.url']);
  if (!remote) {
    const name = git(repository, ['remote'])?.split(/\r?\n/).map((item) => item.trim()).find(Boolean);
    if (name) remote = git(repository, ['remote', 'get-url', name]);
  }
  return canonicalRemoteReference(remote);
}

function projectReference(projectRoot, repository) {
  const value = slashPath(relative(resolve(projectRoot), resolve(repository)));
  if (value === '..' || value.startsWith('../') || isWindowsAbsolutePath(value)) return null;
  return `project://${value || '.'}`;
}

function projectReferencePath(projectRoot, reference) {
  if (typeof reference !== 'string' || !reference.startsWith('project://')) return null;
  const root = resolve(projectRoot);
  const value = reference.slice('project://'.length) || '.';
  const path = resolve(root, value);
  const relativePath = slashPath(relative(root, path));
  if (relativePath === '..' || relativePath.startsWith('../') || isWindowsAbsolutePath(relativePath)) return null;
  return path;
}

export function isPortableRepositoryReference(projectRoot, reference) {
  if (typeof reference !== 'string' || !reference.trim()) return false;
  if (reference.startsWith('project://')) return projectReferencePath(projectRoot, reference) !== null;
  return canonicalRemoteReference(reference) !== null;
}

export function portableRepositoryReference(projectRoot, repository, fallbackReference = null) {
  return repositoryRemoteReference(repository)
    ?? projectReference(projectRoot, repository)
    ?? (isPortableRepositoryReference(projectRoot, fallbackReference) ? fallbackReference : null);
}

export function canonicalRepositoryReference(projectRoot, repository) {
  const root = repositoryRoot(repository);
  if (!root) throw new Error(`Could not resolve a Git repository from ${repository}.`);
  const reference = portableRepositoryReference(projectRoot, root);
  if (!reference) {
    throw new Error(
      `Repository ${root} is outside the workflow project and has no portable remote identity. `
      + 'Configure a Git remote before recording it as a repository snapshot.',
    );
  }
  return reference;
}

export function captureRepositorySnapshot(projectRoot, repositoryInput, options = {}) {
  const base = options.cwd ? resolve(options.cwd) : resolve(projectRoot);
  const requested = absoluteFrom(base, repositoryInput);
  const repository = repositoryRoot(requested);
  if (!repository) throw new Error(`Could not resolve a Git repository from ${requested}.`);
  const commit = git(repository, ['rev-parse', 'HEAD']);
  if (!commit) throw new Error(`Could not resolve a Git commit from ${repository}.`);
  return {
    repository,
    reference: canonicalRepositoryReference(projectRoot, repository),
    commit,
  };
}

export function sameRepositoryReference(left, right) {
  if (!left || !right) return false;
  const leftRemote = canonicalRemoteReference(left);
  const rightRemote = canonicalRemoteReference(right);
  if (leftRemote || rightRemote) return leftRemote !== null && leftRemote === rightRemote;
  return String(left) === String(right);
}

function legacyReferencePath(projectRoot, reference) {
  if (typeof reference !== 'string' || !reference.trim()) return null;
  if (reference.startsWith('project://') || canonicalRemoteReference(reference)) return null;
  return absoluteFrom(projectRoot, reference);
}

function configuredBinding(projectRoot, reference) {
  const value = readLocalBindings(projectRoot).repositories[reference];
  if (!value) return null;
  return absoluteFrom(projectRoot, value);
}

function uniqueRepositoryRoots(candidates) {
  const roots = [];
  const seen = new Set();
  for (const candidate of candidates.filter(Boolean)) {
    const root = repositoryRoot(candidate);
    if (!root || seen.has(root)) continue;
    seen.add(root);
    roots.push(root);
  }
  return roots;
}

function matchesSnapshotIdentity(projectRoot, snapshot, repository) {
  const projectPath = projectReferencePath(projectRoot, snapshot.reference);
  if (snapshot.reference?.startsWith('project://')) {
    return Boolean(projectPath && repositoryRoot(projectPath) === repository);
  }
  const expectedRemote = canonicalRemoteReference(snapshot.reference);
  if (!expectedRemote) return true;
  const actualRemote = repositoryRemoteReference(repository);
  return actualRemote === null || actualRemote === expectedRemote;
}

export function resolveRepositoryWorkspace(recordPath, snapshot, options = {}) {
  if (!snapshot?.commit) throw new Error('Repository snapshot does not record a Git commit.');
  const projectRoot = repositoryProjectRoot(recordPath);
  const cwd = options.cwd ? resolve(options.cwd) : projectRoot;
  const override = options.repository ? absoluteFrom(cwd, options.repository) : null;
  const candidates = [
    override,
    configuredBinding(projectRoot, snapshot.reference),
    projectReferencePath(projectRoot, snapshot.reference),
    legacyReferencePath(projectRoot, snapshot.reference),
    cwd,
    projectRoot,
  ];

  for (const repository of uniqueRepositoryRoots(candidates)) {
    if (!gitSucceeds(repository, ['cat-file', '-e', `${snapshot.commit}^{commit}`])) continue;
    if (!matchesSnapshotIdentity(projectRoot, snapshot, repository)) continue;
    return {
      repository,
      reference: portableRepositoryReference(projectRoot, repository, snapshot.reference) ?? snapshot.reference,
      commit: snapshot.commit,
    };
  }

  const hint = options.repository
    ? ` using --repository ${options.repository}`
    : ' Bind an external checkout with "design-workflow repository bind <snapshot-id> --path <checkout>" or pass --repository <path>.';
  throw new Error(`Could not bind repository snapshot ${snapshot.id} (${snapshot.reference}) to an accessible local Git checkout${hint}`);
}

export function bindRepositoryWorkspace(recordPath, snapshot, repositoryInput, options = {}) {
  if (!snapshot?.reference || !snapshot?.commit) {
    throw new Error('Repository binding requires a repository snapshot with a reference and commit.');
  }
  const projectRoot = repositoryProjectRoot(recordPath);
  const cwd = options.cwd ? resolve(options.cwd) : projectRoot;
  const requested = absoluteFrom(cwd, repositoryInput);
  const repository = repositoryRoot(requested);
  if (!repository) throw new Error(`Could not resolve a Git repository from ${requested}.`);
  if (!gitSucceeds(repository, ['cat-file', '-e', `${snapshot.commit}^{commit}`])) {
    throw new Error(`Bound repository does not contain snapshot commit ${snapshot.commit}.`);
  }
  if (!matchesSnapshotIdentity(projectRoot, snapshot, repository)) {
    throw new Error(`Bound repository identity does not match snapshot reference ${snapshot.reference}.`);
  }

  const path = localBindingPath(projectRoot);
  const bindings = readLocalBindings(projectRoot);
  const relativePath = slashPath(relative(projectRoot, repository));
  bindings.repositories[snapshot.reference] = (
    relativePath !== '..' && !relativePath.startsWith('../') && !isWindowsAbsolutePath(relativePath)
      ? (relativePath || '.')
      : repository
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(bindings, null, 2)}\n`, 'utf8');
  return {
    path,
    repository,
    reference: portableRepositoryReference(projectRoot, repository, snapshot.reference) ?? snapshot.reference,
  };
}
