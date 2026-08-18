import { execFileSync } from 'node:child_process';
import { isAbsolute, relative, resolve } from 'node:path';

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
  return value.split('\\').join('/');
}

function stripGitSuffix(value) {
  return value.replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
}

function isWindowsAbsolutePath(value) {
  return /^[A-Za-z]:[\\/]/.test(value);
}

export function canonicalRemoteReference(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  if (isAbsolute(input) || isWindowsAbsolutePath(input) || input.startsWith('project://')) return null;

  if (!input.includes('://')) {
    const scpLike = /^(?:[^@/\s]+@)?([^:/\s]+):(.+)$/.exec(input);
    if (scpLike) {
      const host = scpLike[1].toLowerCase();
      const path = stripGitSuffix(scpLike[2]);
      if (host && path) return `https://${host}/${path}`;
    }
    return null;
  }

  try {
    const url = new URL(input);
    if (url.protocol === 'file:' || !url.host) return null;
    const path = stripGitSuffix(url.pathname);
    if (!path) return null;
    return `https://${url.host.toLowerCase()}/${path}`;
  } catch {
    return null;
  }
}

function repositoryRoot(repository) {
  const root = git(repository, ['rev-parse', '--show-toplevel']);
  return root ? resolve(root) : null;
}

function repositoryRemoteReference(repository) {
  let remote = git(repository, ['config', '--get', 'remote.origin.url']);
  if (!remote) {
    const firstRemote = git(repository, ['remote'])?.split(/\r?\n/).map((item) => item.trim()).find(Boolean);
    if (firstRemote) remote = git(repository, ['remote', 'get-url', firstRemote]);
  }
  return canonicalRemoteReference(remote);
}

function projectReference(cwd, repository) {
  const relativePath = slashPath(relative(resolve(cwd), resolve(repository)));
  if (relativePath === '..' || relativePath.startsWith('../')) return null;
  return `project://${relativePath || '.'}`;
}

function projectReferencePath(cwd, reference) {
  if (typeof reference !== 'string' || !reference.startsWith('project://')) return null;
  const value = reference.slice('project://'.length) || '.';
  return resolve(cwd, value);
}

function legacyReferencePath(cwd, reference) {
  if (typeof reference !== 'string' || !reference.trim()) return null;
  if (reference.startsWith('project://') || canonicalRemoteReference(reference)) return null;
  return isAbsolute(reference) || isWindowsAbsolutePath(reference)
    ? reference
    : resolve(cwd, reference);
}

function portableReference(cwd, repository, fallbackReference = null) {
  return repositoryRemoteReference(repository)
    ?? projectReference(cwd, repository)
    ?? canonicalRemoteReference(fallbackReference);
}

export function captureRepositorySnapshot(cwd, repositoryInput) {
  const requested = isAbsolute(repositoryInput) || isWindowsAbsolutePath(repositoryInput)
    ? repositoryInput
    : resolve(cwd, repositoryInput);
  const repository = repositoryRoot(requested);
  if (!repository) throw new Error(`Could not resolve a Git repository from ${requested}`);
  const commit = git(repository, ['rev-parse', 'HEAD']);
  if (!commit) throw new Error(`Could not resolve a Git commit from ${repository}`);
  const reference = portableReference(cwd, repository);
  if (!reference) {
    throw new Error(`Repository ${repository} is outside the workflow project and has no portable remote identity. Configure a Git remote before recording it as a snapshot.`);
  }
  return { repository, reference, commit };
}

function candidateRoots(cwd, snapshot, repositoryOverride) {
  const candidates = [];
  if (repositoryOverride) candidates.push({ path: repositoryOverride, explicit: true });
  const projectPath = projectReferencePath(cwd, snapshot.reference);
  if (projectPath) candidates.push({ path: projectPath, explicit: false });
  candidates.push({ path: cwd, explicit: false });
  const legacyPath = legacyReferencePath(cwd, snapshot.reference);
  if (legacyPath) candidates.push({ path: legacyPath, explicit: false });

  const roots = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const path = isAbsolute(candidate.path) || isWindowsAbsolutePath(candidate.path)
      ? candidate.path
      : resolve(cwd, candidate.path);
    const root = repositoryRoot(path);
    if (!root || seen.has(root)) continue;
    seen.add(root);
    roots.push({ root, explicit: candidate.explicit });
  }
  return roots;
}

function matchesPortableReference(cwd, snapshot, repository, explicit) {
  const projectPath = projectReferencePath(cwd, snapshot.reference);
  if (projectPath) return repositoryRoot(projectPath) === repository;

  const expectedRemote = canonicalRemoteReference(snapshot.reference);
  if (!expectedRemote) return true;
  const actualRemote = repositoryRemoteReference(repository);
  if (actualRemote === expectedRemote) return true;
  return explicit;
}

export function resolveRepositoryWorkspace(cwd, snapshot, repositoryOverride = null) {
  if (!snapshot?.commit) throw new Error('Repository snapshot does not record a Git commit.');
  for (const { root, explicit } of candidateRoots(cwd, snapshot, repositoryOverride)) {
    if (!gitSucceeds(root, ['cat-file', '-e', `${snapshot.commit}^{commit}`])) continue;
    if (!matchesPortableReference(cwd, snapshot, root, explicit)) continue;
    return root;
  }
  const overrideHint = repositoryOverride ? '' : ' Use --repository <path> to bind an explicit local checkout.';
  throw new Error(`Could not resolve a local checkout for repository snapshot ${snapshot.id ?? snapshot.reference}.${overrideHint}`);
}

export function verifyRepositoryCommit(cwd, snapshot, commit, repositoryOverride = null) {
  const repository = resolveRepositoryWorkspace(cwd, snapshot, repositoryOverride);
  if (!gitSucceeds(repository, ['cat-file', '-e', `${commit}^{commit}`])) {
    throw new Error(`Commit ${commit} does not exist in the resolved Git repository.`);
  }
  const head = git(repository, ['rev-parse', 'HEAD']);
  if (head !== commit) throw new Error(`Commit ${commit} is not HEAD (${head ?? 'unavailable'}).`);
  if (!gitSucceeds(repository, ['merge-base', '--is-ancestor', snapshot.commit, commit]) && snapshot.commit !== commit) {
    throw new Error(`Commit ${commit} does not descend from task baseline ${snapshot.commit}.`);
  }
  const reference = portableReference(cwd, repository, snapshot.reference);
  if (!reference) {
    throw new Error(`Resolved repository ${repository} has no portable identity for the implementation-output snapshot.`);
  }
  return { repository, reference };
}
