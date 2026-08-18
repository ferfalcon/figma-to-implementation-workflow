import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_TOOLKIT_REPOSITORY = 'ferfalcon/figma-to-implementation-workflow';
export const TOOLKIT_REFERENCE_PREFIX = 'toolkit+github://';

const commitPattern = /^[0-9a-f]{40}$/i;
const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const toolkitRoot = resolve(moduleDirectory, '../..');
const packageManifest = JSON.parse(readFileSync(resolve(toolkitRoot, 'package.json'), 'utf8'));

export const TOOLKIT_VERSION = packageManifest.version;

function git(args) {
  try {
    return execFileSync('git', ['-C', toolkitRoot, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function githubRepositoryFromRemote(remote) {
  if (!remote) return null;
  const ssh = remote.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (ssh) return ssh[1];
  const https = remote.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (https) return https[1];
  const sshUrl = remote.match(/^ssh:\/\/git@github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/i);
  return sshUrl?.[1] ?? null;
}

function normalizeRepository(value) {
  const repository = String(value ?? '').trim();
  if (!repositoryPattern.test(repository)) {
    throw new Error(`Toolkit repository must use owner/name form; received ${repository || 'empty value'}.`);
  }
  return repository;
}

function normalizeVersion(value) {
  const version = String(value ?? '').trim();
  if (!versionPattern.test(version)) {
    throw new Error(`Toolkit version must be a semantic version; received ${version || 'empty value'}.`);
  }
  return version;
}

function normalizeCommit(value) {
  const commit = String(value ?? '').trim().toLowerCase();
  if (!commitPattern.test(commit)) {
    throw new Error(`Toolkit commit must be an exact 40-character Git SHA; received ${commit || 'empty value'}.`);
  }
  return commit;
}

export function runtimeToolkitPin(overrides = {}) {
  const explicitCommit = overrides.commit ?? process.env.DESIGN_WORKFLOW_TOOLKIT_COMMIT ?? null;
  const detectedCommit = explicitCommit ?? git(['rev-parse', 'HEAD']);
  if (!detectedCommit) return null;

  const detectedRepository = githubRepositoryFromRemote(git(['remote', 'get-url', 'origin']));
  return {
    repository: normalizeRepository(
      overrides.repository
        ?? process.env.DESIGN_WORKFLOW_TOOLKIT_REPOSITORY
        ?? detectedRepository
        ?? DEFAULT_TOOLKIT_REPOSITORY,
    ),
    version: normalizeVersion(
      overrides.version
        ?? process.env.DESIGN_WORKFLOW_TOOLKIT_VERSION
        ?? TOOLKIT_VERSION,
    ),
    commit: normalizeCommit(detectedCommit),
  };
}

export function toolkitReference(pin) {
  return `${TOOLKIT_REFERENCE_PREFIX}${normalizeRepository(pin.repository)}@${normalizeVersion(pin.version)}`;
}

export function parseToolkitReference(reference) {
  if (typeof reference !== 'string' || !reference.startsWith(TOOLKIT_REFERENCE_PREFIX)) return null;
  const payload = reference.slice(TOOLKIT_REFERENCE_PREFIX.length);
  const separator = payload.lastIndexOf('@');
  if (separator <= 0 || separator === payload.length - 1) return null;
  try {
    return {
      repository: normalizeRepository(payload.slice(0, separator)),
      version: normalizeVersion(payload.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}

export function toolkitPins(record) {
  return (record.snapshots ?? [])
    .filter((snapshot) => snapshot.status === 'Active')
    .map((snapshot) => {
      const source = parseToolkitReference(snapshot.reference);
      if (!source || !commitPattern.test(snapshot.commit ?? '')) return null;
      return {
        ...source,
        commit: snapshot.commit.toLowerCase(),
        snapshot: snapshot.id,
        pinStrength: snapshot.pinStrength,
        role: snapshot.role,
      };
    })
    .filter(Boolean);
}

export function toolkitPinFromRecord(record) {
  const pins = toolkitPins(record);
  if (pins.length === 0) return null;
  return { ...pins.at(-1), ambiguous: pins.length > 1 };
}

function nextToolkitSnapshotId(record) {
  let highest = 0;
  for (const snapshot of record.snapshots ?? []) {
    const match = snapshot.id?.match(/^SRC-DOC-(\d{3,})$/);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `SRC-DOC-${String(highest + 1).padStart(3, '0')}`;
}

export function addToolkitPin(record, pin) {
  const normalized = {
    repository: normalizeRepository(pin.repository),
    version: normalizeVersion(pin.version),
    commit: normalizeCommit(pin.commit),
  };
  const existing = toolkitPinFromRecord(record);
  if (existing) {
    const same = existing.repository === normalized.repository
      && existing.version === normalized.version
      && existing.commit === normalized.commit;
    if (same && !existing.ambiguous) return { changed: false, pin: existing };
    throw new Error(
      `Toolkit source is already pinned to ${existing.repository}@${existing.version}#${existing.commit}. `
      + 'Refusing to replace it implicitly; toolkit upgrades must be explicit and preserve source history.',
    );
  }

  const snapshot = nextToolkitSnapshotId(record);
  record.snapshots.push({
    id: snapshot,
    role: 'Supporting source',
    pinStrength: 'Immutable',
    status: 'Active',
    reference: toolkitReference(normalized),
    commit: normalized.commit,
  });
  return { changed: true, pin: { ...normalized, snapshot, pinStrength: 'Immutable', role: 'Supporting source', ambiguous: false } };
}
