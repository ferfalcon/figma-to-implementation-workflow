import { commitRecordCandidate, prepareRecordMutation } from './record-store.mjs';
import { gitCommandSucceeds, gitValue, resolveRepositoryWorkspace } from './repository-binding.mjs';
import { taskStartCheckpointFindings, taskStartGitFindings } from './git-worktree-policy.mjs';
import { taskStartFindings } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import { nextId } from './utils.mjs';

function repositorySnapshot(record, id) {
  return record.snapshots.find((snapshot) => (
    snapshot.id === id && snapshot.id.startsWith('SRC-REPO-')
  )) ?? null;
}

function invalidateCurrentGate(record) {
  let invalidated = false;
  for (const gate of record.gates) {
    if (gate.stage === record.state.stage && gate.status === 'Active') {
      gate.status = 'Superseded';
      invalidated = true;
    }
  }
  if (invalidated) record.state.status = 'In progress';
}

function latestOutputAnchor(record, repository, head) {
  const latest = record.state.latestOutput
    ? repositorySnapshot(record, record.state.latestOutput)
    : null;
  if (
    !latest
    || latest.role !== 'Implementation output'
    || latest.status === 'Superseded'
    || !latest.commit
    || !gitCommandSucceeds(repository, ['cat-file', '-e', `${latest.commit}^{commit}`])
    || !gitCommandSucceeds(repository, ['merge-base', '--is-ancestor', latest.commit, head])
  ) return null;
  return latest;
}

export function resolveTaskStartBaseline(recordPath, record, task, options = {}) {
  const plannedBaseline = repositorySnapshot(record, task.baseline);
  if (!plannedBaseline?.commit) {
    throw new Error(`Task baseline ${task.baseline} does not record a Git commit.`);
  }

  const binding = resolveRepositoryWorkspace(recordPath, plannedBaseline, options);
  const repository = binding.repository;
  const head = gitValue(repository, ['rev-parse', 'HEAD']);
  if (!head) throw new Error(`Could not resolve HEAD for task ${task.id}.`);

  const latestOutput = latestOutputAnchor(record, repository, head);
  const anchor = latestOutput ?? plannedBaseline;
  if (!gitCommandSucceeds(repository, ['merge-base', '--is-ancestor', anchor.commit, head])) {
    throw new Error(
      `Repository HEAD ${head} does not descend from ${anchor.id} (${anchor.commit}). `
      + `Record and assess the unexpected repository change before starting ${task.id}.`,
    );
  }

  if (head === anchor.commit) {
    const previousBaseline = task.baseline;
    task.baseline = anchor.id;
    return {
      repository,
      reference: anchor.reference,
      commit: head,
      baseline: anchor.id,
      previousBaseline,
      source: anchor.role === 'Implementation output' ? 'latest-output' : 'planned-baseline',
      createdSnapshot: false,
    };
  }

  const checkpointFindings = taskStartCheckpointFindings(
    recordPath, record, repository, anchor.commit, head,
  );
  if (checkpointFindings.length > 0) throw new Error(checkpointFindings.join('\n'));

  const startId = nextId(record.snapshots, 'SRC-REPO-');
  record.snapshots.push({
    id: startId,
    role: 'Task start',
    pinStrength: 'Immutable',
    status: 'Active',
    reference: anchor.reference,
    commit: head,
    parent: anchor.id,
    task: task.id,
  });
  const previousBaseline = task.baseline;
  task.baseline = startId;
  return {
    repository,
    reference: anchor.reference,
    commit: head,
    baseline: startId,
    previousBaseline,
    source: 'task-start-checkpoint',
    createdSnapshot: true,
  };
}

export function startTaskAtCurrentHead(recordPath, taskId, options = {}) {
  const prepared = prepareRecordMutation(recordPath);
  const diagnostics = workflowDiagnostics(recordPath, prepared.record);
  const currentTask = prepared.record.tasks.find((task) => task.id === taskId);
  const findings = [
    ...diagnostics.findings,
    ...taskStartFindings(prepared.record, currentTask),
    ...(currentTask ? taskStartGitFindings(recordPath, prepared.record, currentTask, options) : []),
  ];
  if (findings.length > 0) throw new Error(findings.join('\n'));

  const record = prepared.candidate;
  const task = record.tasks.find((candidate) => candidate.id === taskId);
  const start = resolveTaskStartBaseline(recordPath, record, task, options);

  task.status = 'In progress';
  record.state.currentTask = taskId;
  record.state.status = 'In progress';
  invalidateCurrentGate(record);

  commitRecordCandidate({
    recordPath,
    currentRecord: prepared.record,
    candidate: record,
  });

  return start;
}
