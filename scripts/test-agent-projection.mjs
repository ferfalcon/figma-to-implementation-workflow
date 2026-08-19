#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { buildAgentProjection } from '../cli/lib/agent-projection.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const record = JSON.parse(readFileSync(
  new URL('../tests/fixtures/workflow-record.migration.v2.json', import.meta.url),
  'utf8',
));
const digest = 'd'.repeat(64);
const recordPath = '/tmp/portable-agent/.workflow/workflow-record.json';

const projection = buildAgentProjection(recordPath, record, digest);
assert(projection.generated.projectionVersion === 1, 'Portable projection must expose version 1.');
assert(projection.generated.recordSha256 === digest, 'Portable projection must identify the exact record digest.');
assert(projection.workflow.recordValidAtGeneration, 'Schema-v2 fixture must be valid at projection time.');
assert(projection.workflow.runtimeIntegrity === 'not-evaluated-in-portable-projection', 'Portable projection must not imply runtime integrity.');
assert(projection.state.stage === 9 && projection.state.executionKind === 'task-decomposition', 'Stage 9 must route to task decomposition.');
assert(projection.task.current === null, 'Ready Stage 9 task must not be reported as current.');
assert(projection.task.nextReady === 'P01-T01', 'Portable projection must expose the next Ready task.');
assert(projection.policy.workflowMutation === 'cli-required', 'Healthy schema-v2 projection must keep workflow mutations CLI-owned.');
assert(projection.policy.codeEdits === 'forbidden', 'Stage 9 projection must forbid implementation edits.');
assert(
  projection.resources.required.some((resource) => resource.path === 'prompts/09-task-decomposition.md'),
  'Projection must reuse canonical Stage 9 prompt routing.',
);
assert(!JSON.stringify(projection.resources).includes('"content"'), 'Portable projection must not embed toolkit resource bodies.');

const pinned = structuredClone(record);
pinned.toolkit = {
  repository: 'ferfalcon/figma-to-implementation-workflow',
  revision: 'a'.repeat(40),
};
const pinnedProjection = buildAgentProjection(recordPath, pinned, digest);
assert(
  pinnedProjection.resources.required.every((resource) => resource.location?.revision === 'a'.repeat(40)),
  'Required resources must resolve to the exact pinned toolkit revision.',
);
assert(
  pinnedProjection.resources.conditional[0].selectOneOf.every((resource) => resource.location?.revision === 'a'.repeat(40)),
  'Conditional adapters must resolve to the same pinned toolkit revision.',
);
assert(
  pinnedProjection.policy.toolkitReads === 'exact-pinned-source-only',
  'Pinned portable routing must prohibit mutable toolkit fallback.',
);

const invalid = structuredClone(record);
delete invalid.project.name;
const invalidProjection = buildAgentProjection(recordPath, invalid, digest);
assert(!invalidProjection.workflow.recordValidAtGeneration, 'Invalid record must be reported as invalid at generation.');
assert(invalidProjection.policy.workflowMutation === 'repair-required-via-cli', 'Invalid projection must route workflow mutation to CLI repair.');
assert(invalidProjection.policy.codeEdits === 'forbidden', 'Invalid projection must forbid implementation edits.');

console.log('Portable agent projection routing, pinning, mutation boundary, and integrity tests passed.');
