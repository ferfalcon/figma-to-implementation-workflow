#!/usr/bin/env node

import {
  AGENT_PROTOCOL_VERSION,
  agentResourcesForContext,
  buildAgentContextWhenMissing,
  composeAgentContext,
} from '../cli/lib/agent-context.mjs';
import { runCli as runAgentCli } from '../cli/lib/agent-cli.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fixtureContext() {
  return {
    control: { mode: 'cli-managed', schemaVersion: 2, readOnly: false, record: '.workflow/workflow-record.json' },
    project: { name: 'Agent packet fixture', profile: 'Standard', executionMode: 'Gated' },
    toolkit: { pinned: false, repository: null, version: null, commit: null, snapshot: null, ambiguous: false },
    workflow: { valid: true, findings: [] },
    stage: { number: 4, name: 'Define testable behavior', status: 'In progress', architectureDecision: null },
    execution: {
      kind: 'stage',
      prompt: 'prompts/04-specification.md',
      promptSource: null,
      primaryArtifactTypes: ['SPEC'],
      artifacts: [{ id: 'ART-SPEC', type: 'SPEC', path: 'SPEC.md', status: 'Draft', baseline: ['SRC-DS-001'] }],
      sourceAdapterPolicy: 'Select the matching source adapter from the actual source.',
    },
    sources: { active: [{ id: 'SRC-DS-001', role: 'Input baseline', status: 'Active' }], latestOutput: null, latestValidationRuntime: null },
    tasks: { current: { id: 'P01-T01', status: 'In progress' }, ready: [], nextReady: null },
    profileTransition: null,
    stageCheck: { stage: { number: 4 }, decision: { recordable: false } },
    policy: {
      workflowMutation: 'allowed', implementation: 'forbidden', codeEdits: 'forbidden',
      stageDecision: 'human-approval-required', generatedViews: 'read-only-projections',
    },
    nextAction: 'Complete SPEC.md and run stage check.',
  };
}

const context = fixtureContext();
const resources = agentResourcesForContext(context);
assert(resources.stagePrompt?.path === 'prompts/04-specification.md', 'Stage 4 must resolve the specification prompt.');
assert(resources.stagePrompt.resolution === 'embedded', 'Unpinned runtime resources should be embedded.');
assert(resources.stagePrompt.content.length > 100, 'Embedded stage prompt must contain source content.');
assert(resources.guidance.length === 1 && resources.guidance[0].path === 'guidelines/SPEC.md', 'Stage 4 must select SPEC guidance.');
assert(resources.templates.length === 0, 'Registered target artifacts must not redundantly embed templates.');

const missingArtifactContext = structuredClone(context);
missingArtifactContext.execution.artifacts = [];
const missingArtifactResources = agentResourcesForContext(missingArtifactContext);
assert(missingArtifactResources.templates.length === 1, 'A missing target artifact must resolve its template.');
assert(missingArtifactResources.templates[0].path === 'templates/SPEC.template.md', 'Missing SPEC artifact must select the SPEC template.');

const pinnedContext = structuredClone(context);
pinnedContext.toolkit = {
  pinned: true,
  repository: 'ferfalcon/figma-to-implementation-workflow',
  version: '0.3.0',
  commit: 'f'.repeat(40),
  snapshot: 'SRC-DOC-001',
  ambiguous: false,
};
const pinnedResources = agentResourcesForContext(pinnedContext);
assert(pinnedResources.stagePrompt.content === null, 'A mismatched runtime must not embed unverified toolkit content.');
assert(pinnedResources.stagePrompt.resolution === 'pinned-source-required', 'Pinned mismatch must require the exact pinned source.');
assert(pinnedResources.stagePrompt.source.commit === 'f'.repeat(40), 'Pinned resource must expose the exact toolkit commit.');
assert(pinnedResources.stagePrompt.source.path === 'prompts/04-specification.md', 'Pinned resource must expose the exact prompt path.');

const repairContext = structuredClone(context);
repairContext.execution.kind = 'repair';
const repairResources = agentResourcesForContext(repairContext);
assert(repairResources.stagePrompt === null && repairResources.guidance.length === 0 && repairResources.templates.length === 0, 'Repair execution must withhold ordinary stage resources.');

const record = {
  state: { currentTask: 'P01-T01' },
  tasks: [{
    id: 'P01-T01', title: 'Implement card behavior', status: 'In progress', baseline: 'SRC-REPO-001',
    prerequisites: [], references: ['PLAN-001'], output: null, validation: [], customField: 'preserved',
  }],
};
const packet = composeAgentContext(context, record);
assert(packet.protocolVersion === AGENT_PROTOCOL_VERSION, 'Agent packet must use protocol v2.');
assert(packet.toolkit.pinned === false, 'Agent packet must preserve toolkit state.');
assert(packet.state.stage === 4 && packet.state.stageName === context.stage.name, 'Agent packet must expose resolved stage state.');
assert(packet.policy.codeEdits === 'forbidden', 'Agent packet must preserve executable policy.');
assert(packet.task.current?.customField === 'preserved', 'Agent packet must preserve the full current task record.');
assert(packet.resources.templates.length === 0, 'Agent packet must avoid redundant registered-artifact templates.');
assert(packet.nextAction === context.nextAction, 'Agent packet must preserve the canonical next action.');

const missing = buildAgentContextWhenMissing('/tmp/agent-packet/.workflow/workflow-record.json', { cwd: '/tmp/agent-packet' });
assert(missing.protocolVersion === AGENT_PROTOCOL_VERSION && !missing.initialized, 'Missing-record packet must use protocol v2 and report uninitialized state.');
assert(missing.resources.stagePrompt?.path === 'prompts/00-intake.md', 'Initialization packet must embed the intake prompt.');
assert(missing.policy.codeEdits === 'forbidden', 'Initialization packet must forbid implementation edits.');

function captureStream() {
  let value = '';
  return { stream: { write(chunk) { value += String(chunk); } }, value() { return value; } };
}

for (const args of [['agent-context', '--json'], ['context', '--agent', '--json']]) {
  const stdout = captureStream();
  const stderr = captureStream();
  const exitCode = await runAgentCli(args, { cwd: '/tmp/agent-packet-cli-missing', stdout: stdout.stream, stderr: stderr.stream });
  assert(exitCode === 0, `${args.join(' ')} must succeed for an uninitialized project.`);
  assert(stderr.value() === '', `${args.join(' ')} must not write an initialization error.`);
  const cliPacket = JSON.parse(stdout.value());
  assert(cliPacket.protocolVersion === AGENT_PROTOCOL_VERSION && !cliPacket.initialized, `${args.join(' ')} must emit the protocol-v2 initialization packet.`);
}

console.log('Agent packet resource selection, toolkit-source integrity, protocol, and CLI routing tests passed.');
