#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AGENT_PACKET_PROTOCOL_VERSION,
  CONTRACT_COMPATIBILITY,
  GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION,
  LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION,
  ORCHESTRATION_CONTEXT_PROTOCOL_VERSION,
  PORTABLE_AGENT_PROJECTION_VERSION,
  WORKFLOW_RECORD_SCHEMA_VERSION,
  contractCompatibility,
} from '../cli/lib/contract-compatibility.mjs';
import { AGENT_PROTOCOL_VERSION } from '../cli/lib/agent-context.mjs';
import { AGENT_PROJECTION_VERSION } from '../cli/lib/agent-projection.mjs';
import { LEGACY_SCHEMA_VERSION, SCHEMA_VERSION } from '../cli/lib/workflow-model.mjs';
import { parseCommandIssue } from './github-remote-command.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const ids = CONTRACT_COMPATIBILITY.map((contract) => contract.id);
assert.equal(new Set(ids).size, ids.length, 'Compatibility contract IDs must be unique.');
for (const contract of CONTRACT_COMPATIBILITY) {
  assert(Number.isSafeInteger(contract.currentVersion) && contract.currentVersion > 0, `${contract.id} must have a positive integer currentVersion.`);
  for (const relation of contract.compatibility) {
    assert(contractCompatibility(relation.contract), `${contract.id} references unknown contract ${relation.contract}.`);
    assert(relation.versions.every((version) => Number.isSafeInteger(version) && version > 0), `${contract.id} has an invalid compatible version.`);
  }
}

assert.equal(contractCompatibility('workflow-record').currentVersion, WORKFLOW_RECORD_SCHEMA_VERSION);
assert.equal(contractCompatibility('orchestration-context').currentVersion, ORCHESTRATION_CONTEXT_PROTOCOL_VERSION);
assert.equal(contractCompatibility('agent-packet').currentVersion, AGENT_PACKET_PROTOCOL_VERSION);
assert.equal(contractCompatibility('portable-agent-projection').currentVersion, PORTABLE_AGENT_PROJECTION_VERSION);
assert.equal(contractCompatibility('github-remote-command').currentVersion, GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION);

assert.equal(SCHEMA_VERSION, WORKFLOW_RECORD_SCHEMA_VERSION, 'Workflow model must consume the central current schema version.');
assert.equal(LEGACY_SCHEMA_VERSION, LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION, 'Workflow model must consume the central legacy schema version.');
assert.equal(AGENT_PROTOCOL_VERSION, AGENT_PACKET_PROTOCOL_VERSION, 'Agent packet must consume the central protocol version.');
assert.equal(AGENT_PROJECTION_VERSION, PORTABLE_AGENT_PROJECTION_VERSION, 'Portable projection must consume the central projection version.');

const orchestrationSource = readFileSync(join(root, 'cli', 'lib', 'orchestration-context.mjs'), 'utf8');
assert.match(
  orchestrationSource,
  /protocolVersion:\s*ORCHESTRATION_CONTEXT_PROTOCOL_VERSION/,
  'Orchestration context must consume the central protocol version rather than a local literal.',
);

const agentOrchestration = readFileSync(join(root, 'workflow', 'Agent-Orchestration.md'), 'utf8');
assert(
  agentOrchestration.includes(`protocolVersion: ${AGENT_PACKET_PROTOCOL_VERSION}`),
  'Agent orchestration must document the current agent-packet protocol version.',
);
assert(
  agentOrchestration.includes(`protocol-v${ORCHESTRATION_CONTEXT_PROTOCOL_VERSION} orchestration context`),
  'Agent orchestration must document the current wrapped context protocol version.',
);
assert(
  agentOrchestration.includes(`projection contract v${PORTABLE_AGENT_PROJECTION_VERSION}`),
  'Agent orchestration must document the current portable projection version.',
);

const remoteExecution = readFileSync(join(root, 'workflow', 'GitHub-Remote-Execution.md'), 'utf8');
assert(
  remoteExecution.includes(`"protocolVersion": ${GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION}`),
  'GitHub remote execution must show the current command-envelope protocol version.',
);
assert(
  remoteExecution.includes(`\`protocolVersion\` must be \`${GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION}\``),
  'GitHub remote execution must document the current required command-envelope protocol version.',
);

function commandEvent(protocolVersion) {
  const payload = {
    protocolVersion,
    targetRef: 'feature/compatibility',
    expectedHead: 'a'.repeat(40),
    args: ['stage', 'advance'],
  };
  return {
    action: 'opened',
    repository: { full_name: 'ferfalcon/example' },
    issue: {
      number: 1,
      title: '[design-workflow] command',
      author_association: 'OWNER',
      user: { login: 'ferfalcon' },
      body: `\`\`\`design-workflow-command\n${JSON.stringify(payload)}\n\`\`\``,
    },
  };
}

const acceptedRemote = parseCommandIssue(commandEvent(GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION));
assert.equal(
  acceptedRemote.protocolVersion,
  GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION,
  'Remote command bridge must accept the centrally declared protocol version.',
);
assert.throws(
  () => parseCommandIssue(commandEvent(GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION + 1)),
  /Unsupported remote command protocolVersion/,
  'Remote command bridge must reject undeclared future protocol versions.',
);

console.log('Independent contract versions, compatibility relationships, runtime consumers, documented examples, and remote transport behavior are aligned.');
