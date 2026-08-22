#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  existsSync, mkdtempSync, readFileSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AGENT_PROTOCOL_VERSION } from '../cli/lib/agent-context.mjs';
import { AGENT_PROJECTION_VERSION } from '../cli/lib/agent-projection.mjs';
import { commandInit } from '../cli/lib/commands-v2.mjs';
import { commandArchitecture } from '../cli/lib/commands/stage.mjs';
import { ORCHESTRATION_CONTEXT_PROTOCOL_VERSION } from '../cli/lib/orchestration-context.mjs';
import {
  PROFILES, SCHEMA_VERSION, STAGES, artifactTypesForStage,
} from '../cli/lib/workflow-model.mjs';
import { loadSemanticContract, semanticContractFindings } from './generate-semantic-contract.mjs';
import { parseCommandIssue } from './github-remote-command.mjs';

const sink = { write() {} };
const contract = loadSemanticContract();

assert.deepEqual(
  semanticContractFindings(contract),
  [],
  'semantic contract structure and repository references must be valid',
);

function byId(items) {
  return new Map(items.map((item) => [item.id, item]));
}

const entrypoints = byId(contract.entrypoints);
for (const required of [
  'readme',
  'quickstart',
  'toolkit-agents',
  'consumer-agent-bootstrap',
  'chatgpt-project-settings',
  'figma-preparation-launcher',
  'contributing',
]) {
  assert.ok(entrypoints.has(required), `semantic contract must register ${required}`);
}
assert.equal(entrypoints.get('consumer-agent-bootstrap').path, 'AGENTS-instructions.md');
assert.ok(entrypoints.get('consumer-agent-bootstrap').delegatesTo.includes('workflow/Agent-Orchestration.md'));
assert.deepEqual(entrypoints.get('chatgpt-project-settings').delegatesTo, ['AGENTS-instructions.md']);
assert.deepEqual(entrypoints.get('figma-preparation-launcher').delegatesTo, ['source-adapters/FIGMA-PREPARATION.md']);

const controlModes = byId(contract.controlModes);
assert.deepEqual(
  [...controlModes.keys()].sort(),
  ['cli-managed', 'markdown-only'],
  'semantic contract control modes must match the supported initialization modes',
);

for (const mode of controlModes.values()) {
  const directory = mkdtempSync(join(tmpdir(), `design-workflow-semantic-${mode.id}-`));
  try {
    const code = commandInit(directory, sink, sink, {
      name: 'Semantic contract control-mode test',
      profile: 'Express',
      mode: 'Gated',
      control: mode.id,
    });
    assert.equal(code, 0, `${mode.id} initialization must succeed`);

    const recordExists = existsSync(join(directory, '.workflow', 'workflow-record.json'));
    assert.equal(
      recordExists,
      mode.executable,
      `${mode.id} executable flag must match whether initialization creates canonical workflow state`,
    );
    if (mode.id === 'markdown-only') {
      assert.ok(existsSync(join(directory, 'WORKPACK.md')), 'Markdown-only mode must scaffold narrative control');
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

assert.equal(
  contract.architecture.stage,
  STAGES.indexOf('Define or explicitly skip architecture'),
  'architecture contract must identify the executable architecture stage',
);
assert.equal(contract.architecture.decisionRequired, true);
assert.deepEqual(
  Object.keys(contract.architecture.profiles),
  PROFILES,
  'architecture contract must cover every executable workflow profile',
);

for (const profile of PROFILES) {
  const rule = contract.architecture.profiles[profile];
  const requiredTargets = artifactTypesForStage(profile, contract.architecture.stage, { result: 'Required' });
  const skippedTargets = artifactTypesForStage(profile, contract.architecture.stage, { result: 'Not required' });
  const requiredHasArchitecture = requiredTargets.includes('ARCHITECTURE');
  const skippedHasArchitecture = skippedTargets.includes('ARCHITECTURE');

  if (rule.artifactPolicy === 'never') {
    assert.equal(requiredHasArchitecture, false, `${profile} must not create an architecture artifact before upgrade`);
    assert.equal(skippedHasArchitecture, false, `${profile} must not create an architecture artifact when skipped`);
  } else if (rule.artifactPolicy === 'required-when-required') {
    assert.equal(requiredHasArchitecture, true, `${profile} must require ARCHITECTURE when architecture is required`);
    assert.equal(skippedHasArchitecture, false, `${profile} must omit ARCHITECTURE when architecture is not required`);
  } else if (rule.artifactPolicy === 'required') {
    assert.equal(requiredHasArchitecture, true, `${profile} must include ARCHITECTURE when architecture is required`);
    assert.equal(skippedHasArchitecture, true, `${profile} must include ARCHITECTURE even when the decision is not-required`);
  } else {
    assert.fail(`Unknown architecture artifact policy for ${profile}: ${rule.artifactPolicy}`);
  }

  const directory = mkdtempSync(join(tmpdir(), `design-workflow-semantic-architecture-${profile.toLowerCase()}-`));
  try {
    assert.equal(commandInit(directory, sink, sink, {
      name: 'Semantic contract architecture test',
      profile,
      mode: 'Gated',
      control: 'cli-managed',
    }), 0);
    assert.equal(commandArchitecture(
      directory,
      sink,
      sink,
      ['architecture', 'decide', 'required'],
      { reason: 'Semantic contract behavior test' },
    ), 0);

    const record = JSON.parse(readFileSync(join(directory, '.workflow', 'workflow-record.json'), 'utf8'));
    const blocked = record.state.status === 'Blocked';
    assert.equal(
      blocked,
      rule.requiredDecisionOutcome === 'must-upgrade',
      `${profile} required-architecture outcome must match the semantic contract`,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const protocols = byId(contract.protocols);
const executableProtocolVersions = new Map([
  ['workflow-record-schema', SCHEMA_VERSION],
  ['orchestration-context', ORCHESTRATION_CONTEXT_PROTOCOL_VERSION],
  ['agent-context', AGENT_PROTOCOL_VERSION],
  ['agent-projection', AGENT_PROJECTION_VERSION],
]);
for (const [id, version] of executableProtocolVersions) {
  assert.equal(protocols.get(id)?.version, version, `${id} semantic version must match executable code`);
}

function remoteCommandEvent(protocolVersion) {
  return {
    action: 'opened',
    issue: {
      title: '[design-workflow] command',
      author_association: 'OWNER',
      number: 1,
      user: { login: 'semantic-contract-test' },
      body: `\`\`\`design-workflow-command\n${JSON.stringify({
        protocolVersion,
        targetRef: 'main',
        expectedHead: 'a'.repeat(40),
        args: ['validate'],
      })}\n\`\`\``,
    },
    repository: { full_name: 'example/semantic-contract-test' },
  };
}

const remoteProtocol = protocols.get('github-remote-command');
assert.ok(remoteProtocol, 'semantic contract must register github-remote-command');
assert.equal(
  parseCommandIssue(remoteCommandEvent(remoteProtocol.version)).protocolVersion,
  remoteProtocol.version,
  'declared remote command protocol version must be accepted',
);
assert.throws(
  () => parseCommandIssue(remoteCommandEvent(remoteProtocol.version + 1)),
  /Unsupported remote command protocolVersion/,
  'a newer undeclared remote command protocol version must be rejected',
);

console.log('Semantic contract tests passed (entrypoint ownership, control modes, architecture rules, and protocol versions agree with executable behavior).');
