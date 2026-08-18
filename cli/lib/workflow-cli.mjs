import { existsSync } from 'node:fs';
import { runWorkflowCli } from './commands-v2.mjs';
import { completeTaskAtCurrentHead } from './task-completion.mjs';
import { startTaskAtCurrentHead } from './task-lineage.mjs';
import { mutateRecord, readStoredRecord } from './record-store.mjs';
import {
  bindRepositoryWorkspace, captureRepositorySnapshot, repositoryProjectRoot,
} from './repository-binding.mjs';
import { buildOrchestrationContext } from './orchestration-context.mjs';
import { checkStage } from './stage-check.mjs';
import { deriveNextAction, stageAdvanceFindings } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import {
  fail, normalizeTaskCreateArgs, parseArgs, relativeDisplay, resolveRecordPath, write,
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

function initUsesExecutableRepository(options) {
  return typeof options.repository === 'string'
    && String(options.control ?? 'cli-managed').toLowerCase() !== 'markdown-only';
}

function preflightInitializedRepository(cwd, recordPath, options) {
  if (!initUsesExecutableRepository(options)) return null;
  return captureRepositorySnapshot(repositoryProjectRoot(recordPath), options.repository, { cwd });
}

function applyInitializedRepositoryIdentity(cwd, options, captured) {
  if (!captured) return;
  const recordPath = resolveRecordPath(cwd, options.record);
  if (!existsSync(recordPath)) return;
  mutateRecord(recordPath, (record) => {
    const snapshot = record.snapshots.find((item) => item.id === 'SRC-REPO-001');
    if (!snapshot) throw new Error('Initialized workflow is missing SRC-REPO-001.');
    if (snapshot.commit !== captured.commit) {
      throw new Error(
        `Repository HEAD changed during initialization: expected ${captured.commit}, recorded ${snapshot.commit}. Retry initialization against a stable checkout.`,
      );
    }
    snapshot.reference = captured.reference;
  });
}

export async function runCli(args, environment) {
  const { cwd, stdout, stderr } = environment;
  const parsed = parseArgs(args);
  const { positionals, options } = parsed;
  const command = positionals[0];
  const recordPath = resolveRecordPath(cwd, options.record);

  if (!command || command === 'help' || options.help) {
    const result = await runWorkflowCli(args, environment);
    write(stdout, '\nTask phases and repository binding:');
    write(stdout, '  design-workflow task create [--phase <0-99|P00-P99> | --id <Pxx-Txx>] ...');
    write(stdout, '  design-workflow task start|complete ... [--repository <local-checkout>]');
    write(stdout, '  design-workflow repository bind <SRC-REPO-id> --path <local-checkout>');
    write(stdout, '  Local repository bindings are machine-specific and stored in ignored .workflow/local.json.');
    write(stdout, '  --phase and --id are mutually exclusive. Without either, numbering continues in the highest existing phase.');
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

  if (command === 'repository' && positionals[1] === 'bind' && positionals[2]) {
    try {
      if (typeof options.path !== 'string' || !options.path.trim()) throw new Error('--path <local-checkout> is required.');
      const { record } = readStoredRecord(recordPath);
      const snapshot = record.snapshots.find((item) => item.id === positionals[2] && item.id.startsWith('SRC-REPO-'));
      if (!snapshot) throw new Error(`Repository snapshot ${positionals[2]} not found.`);
      const binding = bindRepositoryWorkspace(recordPath, snapshot, options.path, { cwd });
      write(stdout, `Bound ${snapshot.id} to local checkout ${binding.repository}`);
      write(stdout, `Local binding: ${relativeDisplay(cwd, binding.path)}`);
      return 0;
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  if (command === 'task' && positionals[1] === 'start' && positionals[2]) {
    try {
      const start = startTaskAtCurrentHead(recordPath, positionals[2], {
        cwd,
        repository: options.repository,
      });
      write(stdout, `Started ${positionals[2]} from ${start.baseline} at HEAD ${start.commit}`);
      return 0;
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  if (command === 'task' && positionals[1] === 'complete' && positionals[2]) {
    try {
      const completed = completeTaskAtCurrentHead(recordPath, positionals[2], options, { cwd });
      write(stdout, `Completed ${positionals[2]}; output ${completed.outputId} at HEAD ${completed.commit}`);
      return 0;
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  let workflowArgs = args;
  if (command === 'task' && positionals[1] === 'create' && options.phase !== undefined) {
    try {
      const { record } = load(cwd, options);
      workflowArgs = normalizeTaskCreateArgs(args, record.tasks ?? [], parsed);
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  let initializedRepository = null;
  if (command === 'init') {
    try {
      initializedRepository = preflightInitializedRepository(cwd, recordPath, options);
    } catch (error) {
      return fail(stderr, error instanceof Error ? error.message : String(error));
    }
  }

  const result = await runWorkflowCli(workflowArgs, environment);
  if (result === 0 && command === 'init') {
    try {
      applyInitializedRepositoryIdentity(cwd, options, initializedRepository);
    } catch (error) {
      return fail(stderr, `Workflow initialized but repository identity finalization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return result;
}
