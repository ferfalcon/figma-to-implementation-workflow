import { commitRecordCandidate, prepareRecordMutation } from './record-store.mjs';
import { gitCommandSucceeds, gitValue, resolveRepositoryWorkspace } from './repository-binding.mjs';
import { taskCompletionGitFindings } from './git-worktree-policy.mjs';
import { ID_PATTERNS } from './workflow-model.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import { nextId, values } from './utils.mjs';

function now() {
  return new Date().toISOString();
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

function taskById(record, id) {
  const task = record.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Task ${id} not found.`);
  return task;
}

function optionString(options, name, { required = false } = {}) {
  const value = options[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (required) throw new Error(`--${name} is required.`);
  return null;
}

function verifyCommitLineage(recordPath, record, task, commit, options = {}) {
  const baseline = record.snapshots.find((item) => item.id === task.baseline && item.id.startsWith('SRC-REPO-'));
  if (!baseline?.commit) throw new Error(`Task baseline ${task.baseline} does not record a Git commit.`);
  const binding = resolveRepositoryWorkspace(recordPath, baseline, options);
  const repository = binding.repository;
  if (!gitCommandSucceeds(repository, ['cat-file', '-e', `${commit}^{commit}`])) {
    throw new Error(`Commit ${commit} does not exist in the task repository.`);
  }
  const head = gitValue(repository, ['rev-parse', 'HEAD']);
  if (head !== commit) throw new Error(`Implementation output must equal repository HEAD ${head}; received ${commit}.`);
  if (!gitCommandSucceeds(repository, ['merge-base', '--is-ancestor', baseline.commit, commit])) {
    throw new Error(`Implementation output ${commit} is not a descendant of task baseline ${baseline.commit}.`);
  }
  return { ...binding, baseline };
}

export function completeTaskAtCurrentHead(recordPath, taskId, options = {}, environment = {}) {
  const commit = optionString(options, 'commit', { required: true }).toLowerCase();
  if (!ID_PATTERNS.commit.test(commit)) throw new Error('--commit must be a full 40-character Git SHA.');

  const prepared = prepareRecordMutation(recordPath);
  const diagnostics = workflowDiagnostics(recordPath, prepared.record);
  const currentTask = prepared.record.tasks.find((item) => item.id === taskId);
  const findings = [
    ...diagnostics.findings,
    ...(currentTask ? taskCompletionGitFindings(recordPath, prepared.record, currentTask, commit, {
      cwd: environment.cwd,
      repository: options.repository,
    }) : []),
  ];
  if (findings.length > 0) throw new Error(findings.join('\n'));

  const record = prepared.candidate;
  if (record.state.stage !== 10) throw new Error('Task completion is allowed only during Stage 10.');
  const task = taskById(record, taskId);
  if (task.status !== 'In progress' || record.state.currentTask !== taskId) {
    throw new Error(`${taskId} must be the current In progress task before completion.`);
  }

  for (const pair of values(options.check)) {
    const separator = String(pair).indexOf('=');
    if (separator <= 0 || separator === String(pair).length - 1) {
      throw new Error(`Invalid --check value: ${pair}. Use name=evidence.`);
    }
    const name = String(pair).slice(0, separator).trim();
    const evidence = String(pair).slice(separator + 1).trim();
    const check = task.validation.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (!check) {
      throw new Error(`--check cannot create undeclared validation "${name}". Use "task validation set" first.`);
    }
    check.status = 'Passed';
    check.actual = evidence;
    check.executedAt = now();
    check.evidence = [...new Set([...check.evidence, evidence])];
    delete check.reason;
  }

  if (task.validation.length === 0) throw new Error('Task completion requires declared validation checks.');
  const unresolved = task.validation.filter((check) => (
    check.required ? check.status !== 'Passed' : !['Passed', 'Not applicable'].includes(check.status)
  ));
  if (unresolved.length) {
    throw new Error(`Validation remains unresolved: ${unresolved.map((check) => check.name).join(', ')}`);
  }

  const binding = verifyCommitLineage(recordPath, record, task, commit, {
    cwd: environment.cwd,
    repository: options.repository,
  });
  const outputId = optionString(options, 'output') ?? nextId(record.snapshots, 'SRC-REPO-');
  if (record.snapshots.some((snapshot) => snapshot.id === outputId)) {
    throw new Error(`Snapshot ${outputId} already exists.`);
  }
  record.snapshots.push({
    id: outputId,
    role: 'Implementation output',
    pinStrength: 'Immutable',
    status: 'Active',
    reference: binding.reference,
    commit,
    parent: task.baseline,
    task: taskId,
  });
  task.output = outputId;
  task.status = 'Complete';
  task.blocker = null;
  record.state.currentTask = null;
  record.state.latestOutput = outputId;
  record.state.status = 'Ready';
  invalidateCurrentGate(record);
  commitRecordCandidate({ recordPath, currentRecord: prepared.record, candidate: record });
  return { outputId, commit, repository: binding.repository };
}
