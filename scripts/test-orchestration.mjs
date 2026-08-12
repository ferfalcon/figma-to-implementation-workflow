#!/usr/bin/env node

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deriveNextAction } from '../cli/lib/workflow-actions.mjs';
import { canEditImplementation, stageTargets } from '../cli/lib/orchestration-context.mjs';
import { checkStage } from '../cli/lib/stage-check.mjs';
import { syncGeneratedState } from '../cli/lib/generated-state.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function baseRecord({ stage, mode = 'Gated', status = 'Ready' }) {
  return {
    schemaVersion: 2,
    project: { name: 'Orchestration fixture', profile: 'Express', executionMode: mode },
    state: {
      stage, status, activeInputs: [], currentTask: null, latestOutput: null,
      latestValidationRuntime: null, architectureDecision: null,
    },
    snapshots: [], verifications: [], artifacts: [], traceItems: [], gates: [], tasks: [],
    profileTransitions: [], implementationReviews: [],
  };
}

const stageNine = baseRecord({ stage: 9 });
stageNine.gates.push({ stage: 9, status: 'Active', result: 'Passed' });
stageNine.tasks.push({ id: 'P01-T01', status: 'Ready', prerequisites: [] });
assert(
  deriveNextAction(stageNine).startsWith('Advance to Stage 10'),
  'Stage 9 must advance before a Ready task can start.',
);

const continuousNine = structuredClone(stageNine);
continuousNine.project.executionMode = 'Continuous documentation';
assert(
  deriveNextAction(continuousNine).includes('Switch execution mode'),
  'Continuous documentation must stop before Stage 10.',
);

const stageTen = baseRecord({ stage: 10, status: 'In progress' });
stageTen.tasks.push({ id: 'P01-T01', status: 'Ready', prerequisites: [] });
assert(deriveNextAction(stageTen) === 'Start P01-T01.', 'Stage 10 should start the first Ready task.');
const cleanDiagnostics = { valid: true };
assert(!canEditImplementation(stageTen, cleanDiagnostics, null), 'Stage 10 without a started task must forbid implementation edits.');
stageTen.state.currentTask = 'P01-T01';
stageTen.tasks[0].status = 'In progress';
assert(canEditImplementation(stageTen, cleanDiagnostics, stageTen.tasks[0]), 'The current in-progress Stage 10 task should permit scoped implementation edits.');

const targetFixture = baseRecord({ stage: 3, status: 'In progress' });
assert(stageTargets(targetFixture).join(',') === 'WORKPACK', 'Express stage target must remain WORKPACK.');
targetFixture.project.profile = 'Lite';
assert(stageTargets(targetFixture).join(',') === 'IMPLEMENTATION-BRIEF', 'Lite Stage 3 must target IMPLEMENTATION-BRIEF.');
targetFixture.state.stage = 9;
assert(stageTargets(targetFixture).join(',') === 'TASK', 'Lite Stage 9 primary target must be TASK; TASKS-INDEX remains optional.');
targetFixture.project.profile = 'Standard';
targetFixture.state.stage = 3;
assert(stageTargets(targetFixture).join(',') === 'DESIGN', 'Standard Stage 3 must target DESIGN.');

const directory = mkdtempSync(join(tmpdir(), 'design-workflow-orchestration-'));
const recordPath = join(directory, '.workflow', 'workflow-record.json');
try {
  const timestamp = '2026-08-12T12:00:00.000Z';
  const record = {
    schemaVersion: 2,
    project: { name: 'Express architecture fixture', profile: 'Express', executionMode: 'Gated' },
    state: {
      stage: 6, status: 'Blocked', activeInputs: ['SRC-REPO-001'], currentTask: null,
      latestOutput: null, latestValidationRuntime: null,
      architectureDecision: { result: 'Required', reason: 'Architecture discovered', recordedAt: timestamp },
    },
    snapshots: [{
      id: 'SRC-REPO-001', role: 'Input baseline', pinStrength: 'Immutable', status: 'Active',
      reference: directory, commit: '1'.repeat(40),
    }],
    verifications: [{
      id: 'VER-001', snapshot: 'SRC-REPO-001', result: 'Unchanged', method: 'Fixture',
      evidence: 'Fixture source verified', checkedAt: timestamp,
    }],
    artifacts: [{
      id: 'ART-WORKPACK', type: 'WORKPACK', path: 'WORKPACK.md', status: 'Approved', baseline: ['SRC-REPO-001'],
    }],
    traceItems: [],
    gates: [],
    tasks: [], profileTransitions: [], implementationReviews: [],
  };
  for (let stage = 0; stage < 6; stage += 1) {
    record.gates.push({
      id: `GATE-${String(stage + 1).padStart(3, '0')}`,
      stage, status: 'Active', result: 'Passed', baseline: ['SRC-REPO-001'],
      verifications: ['VER-001'], artifacts: ['ART-WORKPACK'], evidence: `Stage ${stage} fixture`,
      recordedAt: timestamp, approvedBy: 'Fixture owner',
    });
  }
  syncGeneratedState(recordPath, record);
  const result = checkStage(recordPath, record);
  assert(result.decision.recommendedResult === 'Must upgrade', 'Express architecture-required Stage 6 must recommend Must upgrade.');
  assert(result.decision.recordable, 'Must-upgrade decision should be structurally recordable.');
  assert(!result.advance.allowedNow, 'Must-upgrade Stage 6 must not permit advancement.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}

console.log('Agent orchestration context, action eligibility, and stage preflight tests passed.');
