import { execFileSync } from 'node:child_process';
import { commitRecordCandidate, prepareRecordMutation } from './record-store.mjs';
import { taskStartFindings } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';

function git(repository, args) {
  try {
    return execFileSync('git', ['-C', repository, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function repositorySnapshot(record, id) {
  return record.snapshots.find((snapshot) => (
    snapshot.id === id && snapshot.id.startsWith('SRC-REPO-')
  ));
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

export function resolveTaskStartBaseline(record, task) {
  const plannedBaseline = repositorySnapshot(record, task.baseline);
  if (!plannedBaseline?.commit) {
    throw new Error(`Task baseline ${task.baseline} does not record a Git commit.`);
  }

  const repository = plannedBaseline.reference;
  if (!repository || git(repository, ['rev-parse', '--is-inside-work-tree']) !== 'true') {
    throw new Error(`Task baseline ${task.baseline} does not reference an accessible Git repository.`);
  }

  const head = git(repository, ['rev-parse', 'HEAD']);
  if (!head) throw new Error(`Could not resolve HEAD for task ${task.id}.`);

  const latestOutput = record.state.latestOutput
    ? repositorySnapshot(record, record.state.latestOutput)
    : null;
  const latestOutputMatchesHead = Boolean(
    latestOutput
    && latestOutput.role === 'Implementation output'
    && latestOutput.status !== 'Superseded'
    && latestOutput.reference === repository
    && latestOutput.commit === head,
  );

  if (latestOutputMatchesHead) {
    const previousBaseline = task.baseline;
    task.baseline = latestOutput.id;
    return {
      repository,
      commit: head,
      baseline: latestOutput.id,
      previousBaseline,
      source: 'latest-output',
    };
  }

  if (plannedBaseline.commit === head) {
    return {
      repository,
      commit: head,
      baseline: plannedBaseline.id,
      previousBaseline: plannedBaseline.id,
      source: 'planned-baseline',
    };
  }

  const latestDescription = latestOutput?.commit
    ? `${latestOutput.id} (${latestOutput.commit})`
    : 'none';
  throw new Error(
    `Repository HEAD ${head} does not match planned task baseline ${plannedBaseline.id} (${plannedBaseline.commit}) `
    + `or the latest approved implementation output (${latestDescription}). `
    + `Record and assess the unexpected repository change before starting ${task.id}.`,
  );
}

export function startTaskAtCurrentHead(recordPath, taskId) {
  const prepared = prepareRecordMutation(recordPath);
  const diagnostics = workflowDiagnostics(recordPath, prepared.record);
  const currentTask = prepared.record.tasks.find((task) => task.id === taskId);
  const findings = [...diagnostics.findings, ...taskStartFindings(prepared.record, currentTask)];
  if (findings.length > 0) throw new Error(findings.join('\n'));

  const record = prepared.candidate;
  const task = record.tasks.find((candidate) => candidate.id === taskId);
  const start = resolveTaskStartBaseline(record, task);

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
