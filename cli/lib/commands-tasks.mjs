import {
  activeRepositorySnapshot, artifactId, commaList, createArtifactFile, fail,
  nextId, nextTaskId, printFindings, readRecord, relativeDisplay,
  resolveRecordPath, saveRecord, values, write,
} from './utils.mjs';

export function commandTaskCreate(cwd, stdout, stderr, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  if (record.project.profile === 'Express' && record.tasks.length >= 1) return fail(stderr, 'Express permits exactly one implementation task. Upgrade the profile before adding another task.');
  const baseline = typeof options.baseline === 'string' ? options.baseline : activeRepositorySnapshot(record);
  if (!baseline) return fail(stderr, 'No repository snapshot is available. Add one with "snapshot add --kind repo" or pass --baseline.');
  const id = typeof options.id === 'string' ? options.id : nextTaskId(record.tasks);
  if (record.tasks.some((task) => task.id === id)) return fail(stderr, `Task ${id} already exists.`);
  const prerequisites = commaList(options.prerequisites);
  if (record.project.profile === 'Express' && prerequisites.length > 0) return fail(stderr, 'Express tasks cannot have task prerequisites. Upgrade the profile for dependent tasks.');
  const references = commaList(options.references);
  const title = typeof options.title === 'string' ? options.title.trim() : 'Implementation task';
  const file = record.project.profile === 'Express' ? null : createArtifactFile(cwd, 'TASK', {
    taskId: id, title,
    path: typeof options.path === 'string' ? options.path : undefined,
    force: Boolean(options.force),
  });
  record.tasks.push({ id, status: 'Not started', baseline, prerequisites, references, output: null, validation: [] });
  if (record.project.profile !== 'Express') {
    record.artifacts.push({
      id: artifactId(record, 'TASK', id), type: 'TASK', status: 'Draft',
      baseline: [...new Set([...record.state.activeInputs, baseline])],
      ...(references.length ? { references } : {}),
    });
  }
  record.state.stage = Math.max(record.state.stage, 9);
  record.state.status = 'In progress';
  const errors = saveRecord(recordPath, record);
  write(stdout, `Created task ${id}: ${title}`);
  write(stdout, file ? `Task file: ${relativeDisplay(cwd, file)}` : 'Task is consolidated in WORKPACK.md');
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandTaskStart(cwd, stdout, stderr, id, options) {
  if (!id) return fail(stderr, 'Usage: design-workflow task start <task-id>');
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const task = record.tasks.find((item) => item.id === id);
  if (!task) return fail(stderr, `Task ${id} does not exist.`);
  if (task.status === 'Complete') return fail(stderr, `Task ${id} is already complete.`);
  const incomplete = task.prerequisites.filter((dependency) => record.tasks.find((item) => item.id === dependency)?.status !== 'Complete');
  if (incomplete.length > 0) return fail(stderr, `Task prerequisites are incomplete: ${incomplete.join(', ')}`);
  if (record.state.currentTask && record.state.currentTask !== id) return fail(stderr, `Task ${record.state.currentTask} is already in progress.`);
  task.status = 'In progress';
  record.state.currentTask = id;
  record.state.stage = 10;
  record.state.status = 'In progress';
  const errors = saveRecord(recordPath, record);
  write(stdout, `Started task ${id}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

function parseValidationPairs(option, status, stderr) {
  const checks = [];
  for (const item of values(option)) {
    const separator = String(item).indexOf('=');
    if (separator <= 0 || separator === String(item).length - 1) {
      write(stderr, `Invalid validation value: ${item}. Use name=evidence or name=reason.`);
      return null;
    }
    const name = String(item).slice(0, separator).trim();
    const detail = String(item).slice(separator + 1).trim();
    checks.push(status === 'Passed' ? { name, status, evidence: detail } : { name, status, reason: detail });
  }
  return checks;
}

export function commandTaskComplete(cwd, stdout, stderr, id, options) {
  if (!id) return fail(stderr, 'Usage: design-workflow task complete <task-id> --commit <sha> --check <name=evidence>');
  if (typeof options.commit !== 'string' || !/^[0-9a-f]{40}$/i.test(options.commit)) return fail(stderr, '--commit must be a full 40-character Git SHA.');
  const passed = parseValidationPairs(options.check, 'Passed', stderr);
  const notApplicable = parseValidationPairs(options.na, 'Not applicable', stderr);
  if (passed === null || notApplicable === null) return 1;
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const task = record.tasks.find((item) => item.id === id);
  if (!task) return fail(stderr, `Task ${id} does not exist.`);
  if (task.status !== 'In progress' && task.status !== 'Ready') return fail(stderr, `Task ${id} must be Ready or In progress before completion.`);
  const replacements = new Map([...passed, ...notApplicable].map((check) => [check.name.toLowerCase(), check]));
  task.validation = task.validation.map((check) => replacements.get(check.name.toLowerCase()) ?? check);
  for (const check of replacements.values()) {
    if (!task.validation.some((existing) => existing.name.toLowerCase() === check.name.toLowerCase())) task.validation.push(check);
  }
  if (task.validation.length === 0) return fail(stderr, 'At least one validation result is required. Pass --check name=evidence or --na name=reason.');
  const unresolved = task.validation.filter((check) => !['Passed', 'Not applicable'].includes(check.status));
  if (unresolved.length > 0) return fail(stderr, `Required validation remains unresolved: ${unresolved.map((check) => check.name).join(', ')}`);
  const outputId = typeof options.output === 'string' ? options.output : nextId(record.snapshots, 'SRC-REPO-');
  record.snapshots.push({
    id: outputId, role: 'Implementation output', pinStrength: 'Immutable', status: 'Active',
    reference: typeof options.reference === 'string' ? options.reference : `Implementation output for ${id}`,
    commit: options.commit.toLowerCase(), parent: task.baseline, task: id,
  });
  task.output = outputId;
  task.status = 'Complete';
  const taskArtifact = record.artifacts.find((artifact) => artifact.id.includes(id) && artifact.type === 'TASK');
  if (taskArtifact) taskArtifact.status = 'Approved';
  record.state.currentTask = null;
  record.state.latestOutput = outputId;
  record.state.status = 'Ready';
  record.state.stage = Math.max(record.state.stage, 10);
  const errors = saveRecord(recordPath, record);
  write(stdout, `Completed task ${id}`);
  write(stdout, `Implementation output: ${outputId}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandTask(cwd, stdout, stderr, positionals, options) {
  const action = positionals[1];
  if (action === 'create') return commandTaskCreate(cwd, stdout, stderr, options);
  if (action === 'start') return commandTaskStart(cwd, stdout, stderr, positionals[2], options);
  if (action === 'complete') return commandTaskComplete(cwd, stdout, stderr, positionals[2], options);
  return fail(stderr, 'Usage: design-workflow task <create|start|complete>');
}
