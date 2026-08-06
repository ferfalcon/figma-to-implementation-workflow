import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import {
  MODES, PROFILES, PROFILE_ARTIFACTS, STAGES, WORKFLOW_STATUSES,
} from './constants.mjs';
import {
  artifactId, createArtifactFile, fail, gitCommit, normalizeChoice,
  printFindings, readRecord, relativeDisplay, resolveRecordPath,
  saveRecord, validateWorkflowRecord, write,
} from './utils.mjs';

export function commandHelp(stdout) {
  write(stdout, `Design Workflow CLI

Usage:
  design-workflow init --name <name> [--profile Express|Lite|Standard|Full]
  design-workflow status [--json]
  design-workflow next
  design-workflow stage set <0-11> [--status <status>]
  design-workflow mode set <mode>
  design-workflow snapshot add --kind <kind> --reference <text> [options]
  design-workflow artifact create <type> [options]
  design-workflow task create [--title <title>] [options]
  design-workflow task start <task-id>
  design-workflow task complete <task-id> --commit <sha> --check <name=evidence>
  design-workflow validate
  design-workflow trace <domain-id>

Global option:
  --record <path>       Override .workflow/workflow-record.json

Run "design-workflow <command> --help" for command-specific guidance.`);
}

export function commandInit(cwd, stdout, stderr, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  if (existsSync(recordPath) && !options.force) {
    return fail(stderr, `Workflow record already exists at ${recordPath}. Use --force to replace it.`);
  }
  const profile = normalizeChoice(options.profile ?? 'Lite', PROFILES);
  if (!profile) return fail(stderr, `Unknown profile. Choose: ${PROFILES.join(', ')}`);
  const executionMode = normalizeChoice(options.mode ?? 'Gated', MODES);
  if (!executionMode) return fail(stderr, `Unknown execution mode. Choose: ${MODES.join(', ')}`);
  if (executionMode === 'Task-by-task') {
    return fail(stderr, 'Task-by-task mode cannot begin at Stage 0. Initialize in Gated or Continuous documentation mode, then switch after task decomposition.');
  }
  const name = typeof options.name === 'string' && options.name.trim()
    ? options.name.trim()
    : cwd.split(/[\\/]/).filter(Boolean).at(-1) || 'Design implementation project';
  const record = {
    schemaVersion: 1,
    project: { name, profile, executionMode },
    state: { stage: 0, status: 'In progress', activeInputs: [], currentTask: null, latestOutput: null },
    snapshots: [], artifacts: [], tasks: [],
  };
  if (typeof options.design === 'string' && options.design.trim()) {
    record.snapshots.push({
      id: 'SRC-DS-001', role: 'Input baseline', pinStrength: 'Time-bound',
      status: 'Active', reference: options.design.trim(),
    });
    record.state.activeInputs.push('SRC-DS-001');
  }
  if (typeof options.repository === 'string') {
    const repositoryPath = isAbsolute(options.repository) ? options.repository : resolve(cwd, options.repository);
    const commit = gitCommit(repositoryPath);
    if (!commit) return fail(stderr, `Could not resolve a Git commit from ${repositoryPath}`);
    record.snapshots.push({
      id: 'SRC-REPO-001', role: 'Input baseline', pinStrength: 'Immutable',
      status: 'Active', reference: repositoryPath, commit,
    });
    record.state.activeInputs.push('SRC-REPO-001');
  }
  const generated = [];
  for (const type of PROFILE_ARTIFACTS[profile]) {
    const file = createArtifactFile(cwd, type, { force: Boolean(options.force) });
    generated.push(relativeDisplay(cwd, file));
    record.artifacts.push({
      id: artifactId(record, type), type, status: 'Draft', baseline: [...record.state.activeInputs],
    });
  }
  const errors = saveRecord(recordPath, record);
  write(stdout, `Initialized ${profile} workflow: ${name}`);
  write(stdout, `Record: ${relativeDisplay(cwd, recordPath)}`);
  write(stdout, `Generated ${generated.length} artifact file(s):`);
  generated.forEach((file) => write(stdout, `- ${file}`));
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandStatus(cwd, stdout, stderr, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const errors = validateWorkflowRecord(record);
  if (options.json) {
    write(stdout, JSON.stringify({
      record: relativeDisplay(cwd, recordPath), project: record.project, state: record.state,
      counts: {
        snapshots: record.snapshots.length, artifacts: record.artifacts.length,
        tasks: record.tasks.length,
        completeTasks: record.tasks.filter((task) => task.status === 'Complete').length,
      },
      valid: errors.length === 0, findings: errors,
    }, null, 2));
    return errors.length === 0 ? 0 : 1;
  }
  write(stdout, record.project.name);
  write(stdout, `Profile: ${record.project.profile}`);
  write(stdout, `Mode: ${record.project.executionMode}`);
  write(stdout, `Stage: ${record.state.stage} — ${STAGES[record.state.stage]}`);
  write(stdout, `Status: ${record.state.status}`);
  write(stdout, `Active inputs: ${record.state.activeInputs.length}`);
  write(stdout, `Tasks: ${record.tasks.filter((task) => task.status === 'Complete').length}/${record.tasks.length} complete`);
  write(stdout, `Current task: ${record.state.currentTask ?? 'None'}`);
  write(stdout, `Latest output: ${record.state.latestOutput ?? 'None'}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandNext(cwd, stdout, stderr, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const errors = validateWorkflowRecord(record);
  if (errors.length > 0) {
    write(stdout, 'Resolve workflow findings before advancing:');
    errors.forEach((error) => write(stdout, `- ${error}`));
    return 1;
  }
  if (record.state.status === 'Blocked') { write(stdout, 'Next action: resolve the recorded blocker before advancing.'); return 0; }
  if (record.state.currentTask) { write(stdout, `Next action: continue ${record.state.currentTask} and run its required validation.`); return 0; }
  const readyTask = record.tasks.find((task) => task.status !== 'Complete' && task.status !== 'Blocked'
    && task.prerequisites.every((id) => record.tasks.find((candidate) => candidate.id === id)?.status === 'Complete'));
  if (record.state.stage >= 9 && readyTask) { write(stdout, `Next action: start ${readyTask.id}.`); return 0; }
  if (record.state.stage < 11) write(stdout, `Next action: Stage ${record.state.stage + 1} — ${STAGES[record.state.stage + 1]}.`);
  else if (record.state.status === 'Complete') write(stdout, 'Workflow complete. No next action is recorded.');
  else write(stdout, 'Next action: resolve final implementation-review findings and mark the workflow complete.');
  return 0;
}

export function commandStage(cwd, stdout, stderr, positionals, options) {
  if (positionals[1] !== 'set') return fail(stderr, 'Usage: design-workflow stage set <0-11> [--status <status>]');
  const stage = Number(positionals[2]);
  if (!Number.isInteger(stage) || stage < 0 || stage > 11) return fail(stderr, 'Stage must be an integer from 0 through 11.');
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const status = options.status ? normalizeChoice(options.status, WORKFLOW_STATUSES) : 'In progress';
  if (!status) return fail(stderr, `Unknown workflow status. Choose: ${WORKFLOW_STATUSES.join(', ')}`);
  if (record.project.executionMode === 'Task-by-task' && stage < 9) return fail(stderr, 'Task-by-task mode cannot be used before Stage 9. Change mode first.');
  record.state.stage = stage;
  record.state.status = status;
  const errors = saveRecord(recordPath, record);
  write(stdout, `Stage set to ${stage} — ${STAGES[stage]}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandMode(cwd, stdout, stderr, positionals, options) {
  if (positionals[1] !== 'set' || !positionals[2]) return fail(stderr, 'Usage: design-workflow mode set <mode>');
  const mode = normalizeChoice(positionals.slice(2).join(' '), MODES);
  if (!mode) return fail(stderr, `Unknown execution mode. Choose: ${MODES.join(', ')}`);
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  if (mode === 'Task-by-task' && record.state.stage < 9) return fail(stderr, 'Task-by-task mode requires Stage 9 or later.');
  record.project.executionMode = mode;
  const errors = saveRecord(recordPath, record);
  write(stdout, `Execution mode set to ${mode}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandValidate(cwd, stdout, stderr, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const errors = validateWorkflowRecord(record);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}

export function commandTrace(cwd, stdout, stderr, id, options) {
  if (!id) return fail(stderr, 'Usage: design-workflow trace <identifier>');
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const matches = [];
  for (const artifact of record.artifacts) {
    if (artifact.id === id || artifact.baseline.includes(id) || artifact.references?.includes(id)) matches.push(`Artifact ${artifact.id} (${artifact.type}, ${artifact.status})`);
  }
  for (const task of record.tasks) {
    if (task.id === id || task.baseline === id || task.output === id || task.prerequisites.includes(id) || task.references.includes(id)) matches.push(`Task ${task.id} (${task.status})`);
  }
  for (const snapshot of record.snapshots) {
    if (snapshot.id === id || snapshot.parent === id || snapshot.task === id) matches.push(`Snapshot ${snapshot.id} (${snapshot.role}, ${snapshot.status})`);
  }
  if (record.state.activeInputs.includes(id)) matches.push('Workflow state: active input');
  if (record.state.currentTask === id) matches.push('Workflow state: current task');
  if (record.state.latestOutput === id) matches.push('Workflow state: latest output');
  if (matches.length === 0) { write(stdout, `No traceability references found for ${id}.`); return 1; }
  write(stdout, `Traceability for ${id}:`);
  matches.forEach((match) => write(stdout, `- ${match}`));
  return 0;
}
