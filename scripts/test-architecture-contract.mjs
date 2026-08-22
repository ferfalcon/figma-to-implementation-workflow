#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const workflow = read('workflow/Design-Implementation-Workflow.md');
const cliReadme = read('cli/README.md');
const quickstart = read('QUICKSTART.md');
const stageCommands = read('cli/lib/commands/stage.mjs');
const invariants = read('cli/lib/workflow-record-validation-invariants.mjs');

function between(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing section marker: ${startMarker}`);
  const contentStart = start + startMarker.length;
  const end = source.indexOf(endMarker, contentStart);
  assert.notEqual(end, -1, `Missing section marker: ${endMarker}`);
  return source.slice(contentStart, end);
}

const stageSix = between(
  workflow,
  '# Stage 6 — Define architecture when applicable',
  '# Stage 7 — Create the implementation plan',
);
const expressStageSix = between(stageSix, '## Express', '## Lite, Standard, and Full');

assert.match(
  expressStageSix,
  /does not permit required architecture or a separate architecture artifact/i,
  'Express Stage 6 must prohibit required architecture and a separate architecture artifact',
);
assert.match(
  expressStageSix,
  /explicit `not-required` architecture decision/i,
  'Express Stage 6 must require the explicit not-required architecture decision',
);
assert.doesNotMatch(
  expressStageSix,
  /does not permit a separate architecture decision/i,
  'Express Stage 6 must not contradict the executable architecture-decision state',
);

assert.match(
  stageCommands,
  /Architecture decision must be required or not-required\./,
  'The CLI must continue to expose the required/not-required architecture decision',
);
assert.match(
  stageCommands,
  /result === 'Required' && \['Express', 'Lite'\]\.includes\(record\.project\.profile\)[\s\S]*record\.state\.status = 'Blocked'/,
  'Required architecture must continue to block Express and Lite profiles',
);
assert.match(
  invariants,
  /Stage 6 requires an architecture decision/,
  'Stage 6 validation must continue to require an architecture decision',
);
assert.match(
  invariants,
  /Architecture-required Express or Lite work must upgrade/,
  'Stage 6 validation must continue to force an upgrade when Express or Lite requires architecture',
);
assert.match(
  cliReadme,
  /Architecture is an explicit Stage 6 decision:[\s\S]*design-workflow architecture decide not-required/,
  'CLI documentation must continue to describe the explicit Stage 6 not-required decision',
);
assert.match(
  quickstart,
  /design-workflow architecture decide not-required/,
  'Express quickstart must continue to record the not-required architecture decision',
);

console.log('Architecture contract tests passed (Express prose matches executable Stage 6 semantics).');
