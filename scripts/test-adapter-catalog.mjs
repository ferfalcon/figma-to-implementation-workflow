#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADAPTER_KINDS,
  adapterCatalog,
  adapterEntries,
  adapterEntry,
} from '../cli/lib/adapter-catalog.mjs';
import { stageResources } from '../cli/lib/orchestration-resources.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = adapterCatalog();

assert.equal(catalog.catalogVersion, 1, 'Adapter catalog version must remain explicit.');
assert.deepEqual(
  [...ADAPTER_KINDS],
  ['source', 'implementation', 'deployment'],
  'Adapter catalog must contain only source, implementation, and deployment capability kinds.',
);
assert.deepEqual(
  Object.keys(catalog).sort(),
  ['catalogVersion', ...ADAPTER_KINDS].sort(),
  'Adapter catalog root must not become a general workflow registry.',
);
assert(Object.isFrozen(catalog), 'Validated adapter catalog must be immutable at runtime.');
for (const kind of ADAPTER_KINDS) {
  assert(Object.isFrozen(catalog[kind]), `${kind} adapter entries must be immutable at runtime.`);
  assert.equal(
    new Set(catalog[kind].map((entry) => entry.id)).size,
    catalog[kind].length,
    `${kind} adapter IDs must be unique.`,
  );
  for (const entry of catalog[kind]) {
    assert(Object.isFrozen(entry), `${kind}.${entry.id} must be immutable at runtime.`);
    assert(existsSync(join(root, entry.resource)), `${kind}.${entry.id} resource must exist: ${entry.resource}`);
  }
}

assert.deepEqual(
  adapterEntries('source').map((entry) => entry.id),
  ['figma', 'screenshots', 'pdf', 'existing-website', 'mixed-sources'],
  'Catalog must preserve the maintained source adapter set and ordering.',
);
assert.deepEqual(
  adapterEntries('implementation').map(({ id, support, modes }) => ({ id, support, modes })),
  [
    { id: 'astro-typescript', support: 'maintained', modes: ['scaffold', 'adapt'] },
    { id: 'existing-framework', support: 'best-effort', modes: ['adapt'] },
  ],
  'Catalog must preserve current implementation support and capabilities.',
);
assert.deepEqual(
  adapterEntries('deployment').map(({ id, support }) => ({ id, support })),
  [{ id: 'vercel', support: 'maintained' }],
  'Catalog must register the current maintained deployment adapter without changing workflow behavior.',
);
assert.equal(
  adapterEntry('deployment', 'vercel')?.resource,
  'deployment-adapters/VERCEL.md',
  'Adapter lookup must resolve the provider-neutral deployment registry entry.',
);
assert.equal(adapterEntry('deployment', 'missing'), null, 'Unknown adapter IDs must resolve to null.');
assert.throws(() => adapterEntries('transport'), /Unknown adapter kind/, 'Execution transports must not leak into the adapter catalog.');

const record = {
  schemaVersion: 2,
  project: { name: 'Adapter catalog fixture', profile: 'Standard', executionMode: 'Gated' },
  state: {
    stage: 0,
    status: 'In progress',
    activeInputs: [],
    currentTask: null,
    latestOutput: null,
    latestValidationRuntime: null,
    architectureDecision: null,
  },
  snapshots: [],
  verifications: [],
  artifacts: [],
  traceItems: [],
  gates: [],
  tasks: [],
  profileTransitions: [],
  implementationReviews: [],
};

const resources = stageResources(record);
const sourceChoice = resources.conditional.find((resource) => resource.kind === 'source-adapter');
const implementationChoice = resources.conditional.find((resource) => resource.kind === 'implementation-adapter');

assert(sourceChoice, 'Stage resources must continue exposing conditional source adapters.');
assert(implementationChoice, 'Stage resources must continue exposing conditional implementation adapters.');
assert.deepEqual(
  sourceChoice.selectOneOf.map(({ format, path }) => ({ format, path })),
  adapterEntries('source').map(({ id, resource }) => ({ format: id, path: resource })),
  'Orchestration source choices must derive from the adapter catalog rather than a parallel registry.',
);
assert.deepEqual(
  implementationChoice.selectOneOf.map(({ adapter, support, path }) => ({ adapter, support, path })),
  adapterEntries('implementation').map(({ id, support, resource }) => ({ adapter: id, support, path: resource })),
  'Orchestration implementation choices must derive from the adapter catalog rather than a parallel registry.',
);
assert(
  !resources.conditional.some((resource) => resource.kind === 'deployment-adapter'),
  'Registering deployment adapters must not silently make deployment guidance part of every stage packet.',
);

console.log('Adapter catalog tests passed (validated immutable registry, resource integrity, catalog-driven orchestration, and unchanged deployment behavior).');
