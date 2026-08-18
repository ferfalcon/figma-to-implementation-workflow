import { existsSync } from 'node:fs';
import { runWorkflowCli } from './commands-v2.mjs';
import { readStoredRecord } from './record-store.mjs';
import { buildOrchestrationContext } from './orchestration-context.mjs';
import { checkStage } from './stage-check.mjs';
import { deriveNextAction, stageAdvanceFindings, taskStartFindings } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import {
  fail, nextTaskId, parseArgs, relativeDisplay, resolveRecordPath, write,
} from './utils.mjs';

function json(stdout, value) { write(stdout, JSON.stringify(value, null, 2)); }

function contextWhenMissing(cwd, recordPath) {
  return {
    protocolVersion: 1,
    initialized: false,
    control: { mode: null, schemaVersion: null, readOnly: false, record: relativeDisplay(cwd, recordPath) },
    execution: {
      kind: 'initialization', prompt: 'prompts/00-intake.md', primaryArtifactTypes: [], artifacts: [],
      sourceAdapterPolicy: 'Select the matching source adapter after the actual design source is identified.',
    },
    policy: {
      workflowMutation: 'initialize-first', implementation: 'forbidden', codeEdits: 'forbidden',
      stageDecision: 'not-applicable', generatedViews: 'not-initialized',
    },
    nextAction: 'Initialize the workflow before auditing, planning, or implementation.',
  };
}

function load(cwd, options) {
  const recordPath = resolveRecordPath(cwd, options.record);
  return { recordPath, ...readStoredRecord(recordPath) };
}

function removeOption(args, name) {
  const result = [];
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === `--${name}`) {
      const next = args[index + 1];
      if (next !== undefined && !next.startsWith('--')) index += 1;
      continue;
    }
    if (token.startsWith(`--${name}=`)) continue;
    result.push(token);
  }
  return result;
}

export function normalizeTaskCreateArgs(args, record, parsed = parseArgs(args)) {
  const { positionals, options } = parsed;
  if (positionals[0] !== 'task' || positionals[1] !== 'create' || options.phase === undefined) return [...args];
  if (Array.isArray(options.phase)) throw new Error('--phase may be specified only once.');
  if (options.id !== undefined) throw new Error('--phase cannot be combined with --id; choose one task-ID strategy.');
  const id = nextTaskId(record.tasks ?? [], options.phase);
  return [...removeOption(args, 'phase'), '--id', id];
}

export async function runCli(args, environment) {
  const { cwd, stdout, stderr } = environment;
  const parsed = parseArgs(args);
  const { positionals, options } = parsed;
  const command = positionals[0];
  const recordPath = resolveRecordPath(cwd, options.record);

  if (!command || command === 'help' || options.help) {
    const result = await runWorkflowCli(args, environment);
    write(stdout, '\nTask phases:');
    write(stdout, '  design-workflow task create [--phase <0-99|P00-P99>] [--id <Pxx-Txx>] ...');
    write(stdout, '  Without --phase or --id, task numbering continues in the highest existing phase and defaults to Phase 01.');
    write(stdout, '\nAgent orchestration:');
    write(stdout, '  design-workflow context [--json]');
    write(stdout, '  design-workflow stage check [--json]');
    return result;
  }

  if (command === 'context') {
    if (!existsSync(recordPath)) {
      const value = contextWhenMissing(cwd, recordPath);
      if (options.json) json(stdout, value); else write(stdout, value.nextAction);
      return 0;
    }
    try {
      const { record } = readStoredRecord(recordPath);
      const value = buildOrchestrationContext(recordPath, record, { cwd });
      if (options.json) json(stdout, value);
      else {
        write(stdout, `${value.project.name}: Stage ${value.stage.number} — ${value.stage.name}`);
        write(stdout, `Execution: ${value.execution.kind}`);
        write(stdout, `Next action: ${value.nextAction}`);
      }
      return value.workflow.valid ? 0 : 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (options.json) {
        json(stdout, {
          protocolVersion: 1, initialized: true, execution: { kind: 'repair' },
          workflow: { valid: false, findings: [message] }, nextAction: 'Repair the workflow record before continuing.',
        });
        return 1;
      }
      return fail(stderr, message);
    }
  }

  if (command === 'stage' && positionals[1] === 'check') {
    try {
      const { record } = readStoredRecord(recordPath);
      const value = checkStage(recordPath, record);
      if (options.json) json(stdout, value);
      else {
        write(stdout, `Stage ${value.stage.number} — ${value.stage.name}`);
        write(stdout, `Recommended decision: ${value.decision.recommendedResult ?? 'None'}`);
        write(stdout, value.advance.allowedNow ? 'Advancement is currently permitted.' : 'Advancement is not currently permitted.');
        for (const finding of value.decision.findings) write(stdout, `- ${finding}`);
      }
      return value.decision.recordable || value.advance.allowedNow ? 0 : 1;
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  if (command === 'next') {
    try {
      const { recordPath: path, record } = load(cwd, options);
      const diagnostics = workflowDiagnostics(path, record);
      if (diagnostics.findings.length > 0) {
        return fail(stderr, `Resolve workflow findings before continuing:\n${diagnostics.findings.map((item) => `- ${item}`).join('\n')}`);
      }
      write(stdout, `Next action: ${deriveNextAction(record)}`);
      return 0;
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  if (command === 'stage' && positionals[1] === 'advance') {
    try {
      const { recordPath: path, record } = load(cwd, options);
      const diagnostics = workflowDiagnostics(path, record);
      const findings = [...diagnostics.findings, ...stageAdvanceFindings(record)];
      if (findings.length > 0) return fail(stderr, findings.join('\n'));
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  if (command === 'task' && positionals[1] === 'start' && positionals[2]) {
    try {
      const { recordPath: path, record } = load(cwd, options);
      const diagnostics = workflowDiagnostics(path, record);
      const task = record.tasks.find((item) => item.id === positionals[2]);
      const findings = [...diagnostics.findings, ...taskStartFindings(record, task)];
      if (findings.length > 0) return fail(stderr, findings.join('\n'));
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  let workflowArgs = args;
  if (command === 'task' && positionals[1] === 'create' && options.phase !== undefined) {
    try {
      const { record } = load(cwd, options);
      workflowArgs = normalizeTaskCreateArgs(args, record, parsed);
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  return runWorkflowCli(workflowArgs, environment);
}