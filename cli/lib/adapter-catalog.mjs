import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const catalogPath = resolve(root, 'workflow', 'adapter-catalog.json');

export const ADAPTER_KINDS = Object.freeze(['source', 'implementation', 'deployment']);

const RESOURCE_PREFIXES = Object.freeze({
  source: 'source-adapters/',
  implementation: 'implementation-adapters/',
  deployment: 'deployment-adapters/',
});
const SUPPORT_LEVELS = new Set(['maintained', 'best-effort']);
const IMPLEMENTATION_MODES = new Set(['scaffold', 'adapt']);
const ENTRY_KEYS = Object.freeze({
  source: new Set(['id', 'resource']),
  implementation: new Set(['id', 'resource', 'support', 'modes', 'scaffoldResource']),
  deployment: new Set(['id', 'resource', 'support']),
});

function fail(message) {
  throw new Error(`Invalid adapter catalog: ${message}`);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function safeRepositoryPath(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) {
    fail(`${label} must be a non-empty trimmed string.`);
  }
  if (isAbsolute(value) || value.includes('\\') || value.split('/').some((part) => part === '.' || part === '..')) {
    fail(`${label} must be a repository-relative POSIX path without traversal.`);
  }
}

function validateResource(kind, resource, entryId) {
  safeRepositoryPath(resource, `${kind}.${entryId}.resource`);
  if (!resource.startsWith(RESOURCE_PREFIXES[kind]) || !resource.endsWith('.md')) {
    fail(`${kind}.${entryId}.resource must stay under ${RESOURCE_PREFIXES[kind]} and point to Markdown guidance.`);
  }
  if (!existsSync(resolve(root, resource))) {
    fail(`${kind}.${entryId}.resource does not exist: ${resource}`);
  }
}

function validateScaffoldResource(entry) {
  const label = `implementation.${entry.id}.scaffoldResource`;
  if (!entry.modes.includes('scaffold')) {
    if ('scaffoldResource' in entry) fail(`${label} is only valid when scaffold mode is declared.`);
    return;
  }
  safeRepositoryPath(entry.scaffoldResource, label);
  if (!entry.scaffoldResource.startsWith('implementation-adapters/')) {
    fail(`${label} must stay under implementation-adapters/.`);
  }
  const scaffoldPath = resolve(root, entry.scaffoldResource);
  if (!existsSync(scaffoldPath) || !statSync(scaffoldPath).isDirectory()) {
    fail(`${label} must identify an existing scaffold resource directory.`);
  }
}

function validateEntry(kind, entry, index) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    fail(`${kind}[${index}] must be an object.`);
  }

  const allowedKeys = ENTRY_KEYS[kind];
  const unknownKeys = Object.keys(entry).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length > 0) {
    fail(`${kind}[${index}] contains unsupported keys: ${unknownKeys.join(', ')}.`);
  }

  if (typeof entry.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
    fail(`${kind}[${index}].id must be a lowercase kebab-case identifier.`);
  }

  validateResource(kind, entry.resource, entry.id);

  if (kind !== 'source') {
    if (!SUPPORT_LEVELS.has(entry.support)) {
      fail(`${kind}.${entry.id}.support must be one of: ${[...SUPPORT_LEVELS].join(', ')}.`);
    }
  }

  if (kind === 'implementation') {
    if (!Array.isArray(entry.modes) || entry.modes.length === 0) {
      fail(`implementation.${entry.id}.modes must be a non-empty array.`);
    }
    if (new Set(entry.modes).size !== entry.modes.length) {
      fail(`implementation.${entry.id}.modes must not contain duplicates.`);
    }
    const invalidModes = entry.modes.filter((mode) => !IMPLEMENTATION_MODES.has(mode));
    if (invalidModes.length > 0) {
      fail(`implementation.${entry.id}.modes contains unsupported modes: ${invalidModes.join(', ')}.`);
    }
    validateScaffoldResource(entry);
  }
}

function loadAdapterCatalog() {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch (error) {
    fail(`could not read ${catalogPath}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail('root must be an object.');
  }
  if (parsed.catalogVersion !== 1) fail('catalogVersion must be 1.');

  const expectedRootKeys = new Set(['catalogVersion', ...ADAPTER_KINDS]);
  const unknownRootKeys = Object.keys(parsed).filter((key) => !expectedRootKeys.has(key));
  const missingRootKeys = [...expectedRootKeys].filter((key) => !(key in parsed));
  if (unknownRootKeys.length > 0) fail(`unsupported root keys: ${unknownRootKeys.join(', ')}.`);
  if (missingRootKeys.length > 0) fail(`missing root keys: ${missingRootKeys.join(', ')}.`);

  for (const kind of ADAPTER_KINDS) {
    const entries = parsed[kind];
    if (!Array.isArray(entries) || entries.length === 0) {
      fail(`${kind} must be a non-empty array.`);
    }

    const ids = new Set();
    entries.forEach((entry, index) => {
      validateEntry(kind, entry, index);
      if (ids.has(entry.id)) fail(`${kind} contains duplicate adapter id: ${entry.id}.`);
      ids.add(entry.id);
    });
  }

  return deepFreeze(parsed);
}

const catalog = loadAdapterCatalog();

export function adapterCatalog() {
  return catalog;
}

export function adapterEntries(kind) {
  if (!ADAPTER_KINDS.includes(kind)) {
    throw new Error(`Unknown adapter kind: ${kind}`);
  }
  return catalog[kind];
}

export function adapterEntry(kind, id) {
  return adapterEntries(kind).find((entry) => entry.id === id) ?? null;
}
