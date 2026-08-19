import { relative } from 'node:path';
import { checkStage } from './stage-check.mjs';
import { toolkitBindingFromRecord } from './toolkit-binding.mjs';
import {
  resourceLocation, STAGE_PROMPTS, stageResources, stageTargets,
} from './orchestration-resources.mjs';
import { deriveNextAction, readyTask } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import { STAGES } from './workflow-model.mjs';
import { projectRootForRecord } from './workspace.mjs';

function executionKind(record, diagnostics) {
  if (record.schemaVersion === 1) return 'migration';
  if (!diagnostics.valid) return 'repair';
  if ((record.profileTransitions ?? []).some((item) => item.status === 'In progress')) return 'profile-upgrade';
  if (record.state.status === 'Blocked') return 'blocker';
  if (record.state.stage === 9) return 'task-decomposition';
  if (record.state.stage === 10) return 'implementation-task';
  if (record.state.stage === 11) return 'final-review';
  return 'stage';
}

function latestVerification(record, snapshotId) {
  return [...(record.verifications ?? [])].reverse().find((item) => item.snapshot === snapshotId) ?? null;
}

function taskSummary(task) {
  return {
    id: task.id,
    status: task.status,
    baseline: task.baseline,
    prerequisites: task.prerequisites,
    references: task.references,
    output: task.output,
    validation: (task.validation ?? []).map((check) => ({
      name: check.name,
      kind: check.kind,
      required: check.required,
      status: check.status,
      subject: check.subject ?? null,
      references: check.references,
    })),
  };
}

function projectRootDisplay(recordPath, cwd) {
  return relative(cwd, projectRootForRecord(recordPath)).split('\\').join('/') || '.';
}

export function canEditImplementation(record, diagnostics, currentTask) {
  return (
    diagnostics.valid
    && record.schemaVersion === 2
    && record.state.stage === 10
    && record.project.executionMode !== 'Continuous documentation'
    && currentTask?.status === 'In progress'
    && record.state.currentTask === currentTask.id
  );
}

export { STAGE_PROMPTS, stageResources, stageTargets } from './orchestration-resources.mjs';

export function buildOrchestrationContext(recordPath, record, { cwd }) {
  const diagnostics = workflowDiagnostics(recordPath, record);
  const stage = record.state.stage;
  const targets = stageTargets(record);
  const activeArtifacts = record.artifacts.filter((artifact) => artifact.status !== 'Superseded');
  const targetArtifacts = activeArtifacts.filter((artifact) => targets.includes(artifact.type));
  const currentTask = record.state.currentTask
    ? record.tasks.find((task) => task.id === record.state.currentTask) ?? null
    : null;
  const nextReadyTask = readyTask(record) ?? null;
  const check = checkStage(recordPath, record);
  const implementationAllowed = canEditImplementation(record, diagnostics, currentTask);
  const toolkit = toolkitBindingFromRecord(record);
  const prompt = STAGE_PROMPTS[stage] ?? null;
  const resources = stageResources(record, toolkit);

  return {
    protocolVersion: 2,
    initialized: true,
    control: {
      mode: 'cli-managed',
      schemaVersion: record.schemaVersion,
      readOnly: record.schemaVersion !== 2,
      record: relative(cwd, recordPath).split('\\').join('/'),
    },
    project: {
      name: record.project.name,
      profile: record.project.profile,
      executionMode: record.project.executionMode,
      root: projectRootDisplay(recordPath, cwd),
    },
    toolkit,
    workflow: diagnostics,
    stage: {
      number: stage,
      name: STAGES[stage] ?? 'Unknown stage',
      status: record.state.status,
      architectureDecision: record.state.architectureDecision,
    },
    execution: {
      kind: executionKind(record, diagnostics),
      prompt,
      promptSource: resourceLocation(toolkit, prompt),
      resources,
      primaryArtifactTypes: targets,
      artifacts: targetArtifacts.map((artifact) => ({
        id: artifact.id,
        type: artifact.type,
        path: artifact.path,
        status: artifact.status,
        baseline: artifact.baseline,
        approvedRevision: artifact.approvedRevision ?? null,
      })),
      sourceAdapterPolicy: 'Select the matching source adapter from execution.resources.conditional using the actual source; source format is not canonical record state in schema v2.',
    },
    sources: {
      active: record.state.activeInputs.map((id) => {
        const snapshot = record.snapshots.find((item) => item.id === id);
        return snapshot ? { ...snapshot, latestVerification: latestVerification(record, id) } : { id, missing: true };
      }),
      latestOutput: record.state.latestOutput,
      latestValidationRuntime: record.state.latestValidationRuntime,
    },
    tasks: {
      current: currentTask ? taskSummary(currentTask) : null,
      ready: record.tasks.filter((task) => task.status === 'Ready').map(taskSummary),
      nextReady: nextReadyTask ? nextReadyTask.id : null,
    },
    profileTransition: record.profileTransitions.find((item) => item.status === 'In progress') ?? null,
    stageCheck: check,
    policy: {
      workflowMutation: record.schemaVersion === 2 && diagnostics.valid ? 'allowed' : 'repair-or-migration-required',
      implementation: implementationAllowed ? 'allowed-with-current-task-scope' : 'forbidden',
      codeEdits: implementationAllowed ? 'allowed-with-current-task-scope' : 'forbidden',
      stageDecision: record.project.executionMode === 'Gated' ? 'human-approval-required' : 'agent-permitted-when-evidence-supports-it',
      generatedViews: 'read-only-projections',
      workflowReads: 'context-resource-manifest-only',
    },
    nextAction: deriveNextAction(record),
  };
}
