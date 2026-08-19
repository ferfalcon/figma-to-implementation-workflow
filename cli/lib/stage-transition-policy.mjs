function stageTransitionBlocker(record, workflowValid) {
  if (record.schemaVersion === 1) return 'migration-required';
  if (!workflowValid) return 'repair-required';
  return null;
}

function decisionAuthority(record, workflowReady) {
  if (!workflowReady) return 'not-applicable';
  return record.project.executionMode === 'Gated' ? 'human-required' : 'agent-permitted';
}

export function stageTransitionPolicy(record, { workflowValid, cliAvailable }) {
  const blocker = stageTransitionBlocker(record, workflowValid);
  const workflowReady = blocker === null;
  const capabilityBlocker = workflowReady && !cliAvailable ? 'cli-unavailable-in-current-environment' : blocker;

  return {
    decisionAuthority: decisionAuthority(record, workflowReady),
    preflight: {
      required: workflowReady,
      executor: 'design-workflow stage check',
      availableHere: workflowReady && cliAvailable,
      blocker: capabilityBlocker,
    },
    execution: {
      executor: 'design-workflow stage review/advance',
      availableHere: workflowReady && cliAvailable,
      blocker: capabilityBlocker,
    },
  };
}
