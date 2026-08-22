export const WORKFLOW_RECORD_SCHEMA_VERSION = 2;
export const LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION = 1;
export const ORCHESTRATION_CONTEXT_PROTOCOL_VERSION = 3;
export const AGENT_PACKET_PROTOCOL_VERSION = 4;
export const PORTABLE_AGENT_PROJECTION_VERSION = 4;
export const GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION = 1;

function entry({
  id, label, kind, currentVersion, owner, compatibility = [], notes = [],
}) {
  return Object.freeze({
    id,
    label,
    kind,
    currentVersion,
    owner,
    compatibility: Object.freeze(compatibility.map((item) => Object.freeze({
      contract: item.contract,
      versions: Object.freeze([...item.versions]),
      mode: item.mode,
    }))),
    notes: Object.freeze([...notes]),
  });
}

export const CONTRACT_COMPATIBILITY = Object.freeze([
  entry({
    id: 'workflow-record',
    label: 'Workflow record',
    kind: 'schema',
    currentVersion: WORKFLOW_RECORD_SCHEMA_VERSION,
    owner: 'cli/lib/workflow-model.mjs + schemas/workflow-record.schema.json',
    compatibility: [
      { contract: 'workflow-record', versions: [WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'canonical-read-write' },
      { contract: 'workflow-record', versions: [LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'migration-only' },
    ],
    notes: [
      'Schema v2 is the canonical writable workflow record.',
      'Schema v1 is legacy input only and must migrate before ordinary workflow mutation.',
    ],
  }),
  entry({
    id: 'orchestration-context',
    label: 'Orchestration context',
    kind: 'protocol',
    currentVersion: ORCHESTRATION_CONTEXT_PROTOCOL_VERSION,
    owner: 'cli/lib/orchestration-context.mjs',
    compatibility: [
      { contract: 'workflow-record', versions: [WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'normal' },
      { contract: 'workflow-record', versions: [LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'migration-or-repair-routing' },
    ],
    notes: [
      'The current CLI emits context protocol v3 for initialized CLI-managed state.',
      'Its version is independent from workflow-record schemaVersion.',
    ],
  }),
  entry({
    id: 'agent-packet',
    label: 'Agent packet',
    kind: 'protocol',
    currentVersion: AGENT_PACKET_PROTOCOL_VERSION,
    owner: 'cli/lib/agent-context.mjs',
    compatibility: [
      { contract: 'orchestration-context', versions: [ORCHESTRATION_CONTEXT_PROTOCOL_VERSION], mode: 'wrapped-context' },
      { contract: 'workflow-record', versions: [WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'normal' },
      { contract: 'workflow-record', versions: [LEGACY_WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'migration-or-repair-routing' },
    ],
    notes: [
      'The packet exposes the wrapped context version separately as contextProtocolVersion.',
      'An uninitialized project uses the same packet protocol with contextProtocolVersion null.',
    ],
  }),
  entry({
    id: 'portable-agent-projection',
    label: 'Portable agent projection',
    kind: 'projection',
    currentVersion: PORTABLE_AGENT_PROJECTION_VERSION,
    owner: 'cli/lib/agent-projection.mjs',
    compatibility: [
      { contract: 'workflow-record', versions: [WORKFLOW_RECORD_SCHEMA_VERSION], mode: 'normal-generation' },
    ],
    notes: [
      'AGENT-CONTEXT.json is a read-only generated projection, not a second workflow engine.',
      'Its projectionVersion is independent from the executable agent-packet protocol even when both numbers happen to match.',
    ],
  }),
  entry({
    id: 'github-remote-command',
    label: 'GitHub remote command',
    kind: 'protocol',
    currentVersion: GITHUB_REMOTE_COMMAND_PROTOCOL_VERSION,
    owner: 'scripts/github-remote-command.mjs',
    compatibility: [],
    notes: [
      'The issue-envelope protocol is an independent transport for canonical CLI argv and exact expected branch HEAD.',
      'Runtime workflow compatibility is determined by the exact pinned toolkit revision executed by the bridge, not by agent-packet or projection version numbers.',
    ],
  }),
]);

export function contractCompatibility(id) {
  return CONTRACT_COMPATIBILITY.find((contract) => contract.id === id) ?? null;
}
