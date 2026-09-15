#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stageResources } from '../cli/lib/orchestration-resources.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const record = {
  schemaVersion: 2,
  project: { name: 'Source adapter fixture', profile: 'Standard', executionMode: 'Gated' },
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
assert(
  resources.required.some((resource) => resource.path === 'workflow/Source-Adapters.md'),
  'Stage 0 must load the canonical source-adapter contract.',
);

const sourceChoice = resources.conditional.find((resource) => resource.kind === 'source-adapter');
assert(sourceChoice, 'Orchestration must expose conditional source-adapter choices.');
assert.deepEqual(
  sourceChoice.selectOneOf.map((choice) => choice.format).sort(),
  ['existing-website', 'figma', 'mixed-sources', 'pdf', 'screenshots'],
  'Source adapter registry must expose only the maintained source formats.',
);
assert(
  sourceChoice.selectOneOf.every((choice) => choice.path.startsWith('source-adapters/')),
  'Source adapter implementations must remain provider/format-specific resources.',
);

const contract = read('workflow/Source-Adapters.md');
for (const phrase of [
  'not alternate workflows',
  'Source-Authority.md',
  'Source-Snapshots.md',
  'does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json`',
  'Do not ask the human to choose an internal source adapter',
  'Source preparation and source inspection remain distinct.',
]) {
  assert(contract.includes(phrase), `Source adapter contract must preserve: ${phrase}`);
}

const figma = read('source-adapters/FIGMA.md');
assert(figma.includes('# Figma Source Adapter'));
assert(figma.includes('A normal Figma URL is mutable.'));
assert(figma.includes('It does not independently prove:'));

const mixed = read('source-adapters/MIXED-SOURCES.md');
assert(
  mixed.toLowerCase().includes('mixed'),
  'Mixed-sources adapter must remain available for genuinely multi-source work.',
);

const semantic = JSON.parse(read('workflow/semantic-contract.json'));
assert(
  semantic.domains.some((domain) => domain.id === 'source-adapters'
    && domain.owner === 'workflow/Source-Adapters.md'),
  'Semantic contract must register source adapters under the provider-neutral source contract.',
);

console.log('Source adapter tests passed (provider-neutral ownership, conditional selection, source authority separation, and maintained format coverage).');
