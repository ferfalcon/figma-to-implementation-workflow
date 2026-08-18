import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGES } from './workflow-model.mjs';
import { deriveNextAction, readyTask } from './workflow-actions.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';
import { checkStage } from './stage-check.mjs';

const TOOLKIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLKIT_PACKAGE = JSON.parse(readFileSync(resolve(TOOLKIT_ROOT, 'package.json'), 'utf8'));

export const TOOLKIT_REPOSITORY = 'ferfalcon/figma-to-implementation-workflow';

export const STAGE_PROMPTS = [
  'prompts/00-intake.md',
  'prompts/01-audit.md',
  'prompts/02-requirements.md',
  'prompts/03-design.md',
  'prompts/04-specification.md',
  'prompts/05-document-review.md',
  'prompts/06-architecture.md',
  'prompts/07-plan.md',
  'prompts/08-plan-review.md',
  'prompts/09-task-decomposition.md',
  'prompts/10-implement-task.md',
  'prompts/11-implementation-review.md',
];

const STAGE_REQUIRED_RESOURCES = {
  0: [
    'workflow/Workflow-Profiles.md',
    'workflow/Source-Snapshots.md',
    'workflow/Source-Authority.md',
  ],
  1: ['workflow/Source-Authority.md'],
  2: ['guidelines/REQUIREMENTS.md'],
  3: ['guidelines/DESIGN.md'],
  4: ['guidelines/SPEC.md'],
  5: [
    'guidelines/REQUIREMENTS.md',
    'guidelines/DESIGN.md',
    'guidelines/SPEC.md',
  ],
  6: ['guidelines/ARCHITECTURE.md'],
  7: ['guidelines/PLAN.md'],
  8: ['guidelines/PLAN.md', 'workflow/Validation-Rules.md'],
  9: ['workflow/Identifier-Conventions.md', 'workflow/Validation-Rules.md'],
  10: ['workflow/Validation-Rules.md'],
  11: ['workflow/Validation-Rules.md'],
};

function gitToolkitRevision() {
  try {
    const topLevel = execFileSync(
      'git',
      ['-C', TOOLKIT_ROOT, 'rev-parse', '--show-toplevel'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    if (resolve(topLevel) !== TOOLKIT_ROOT) return null;
    return execFileSync(
      'git',
      ['-C', TOOLKIT_ROOT, 'rev-parse', 'HEAD'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim() || null;
  } catch {
    return null;
  }
}

export function buildToolkitDescriptor() {
  const environmentRevision = process.env.DESIGN_WORKFLOW_TOOLKIT_REVISION?.trim() || null;
  const revision = environmentRevision ?? gitToolkitRevision();
  return {
    repository: TOOLKIT_REPOSITORY,
    revision,
    version: TOOLKIT_PACKAGE.version,
    resolution: environmentRevision ? 'environment' : revision ? 'git-commit' : 'package-version',
  };
}

export function buildToolkitResource(path, toolkit = buildToolkitDescriptor()) {
  return {
    path,
    repository: toolkit.repository,
    revision: toolkit.revision,
    version: toolkit.version,
  };
}

export function requiredResourcePathsForStage(stage) {
  return [
    'workflow/Agent-Orchestration.md',
    ...(STAGE_REQUIRED_RESOURCES[stage] ?? []),
  ];
}

export function stageTargets(record) {
  const profile = record.project.profile;
  const stage = record.state.stage;
  if (profile === 'Express') return ['WORKPACK'];
  if (stage === 0) return ['SOURCE-BASELINE', 'PROJECT-CONTEXT', 'WORKFLOW-STATE'];
  if (stage === 1) return ['DESIGN-AUDIT'];
  if (profile === 'Lite' && stage >= 2 && stage <= 8) return ['IMPLEMENTATION-BRIEF'];
  if (stage === 2) return ['REQUIREMENTS'];
  if (stage === 3) return ['DESIGN'];
  if (stage === 4) return ['SPEC'];
  if (stage === 5) return ['DOCUMENT-REVIEW'];
  if (stage === 6) {
    return record.state.architectureDecision?.result === 'Required' || profile === 'Full'
      ? ['ARCHITECTURE']
      : ['WORKFLOW-STATE'];
  }
  if (stage === 7) return ['PLAN'];
  if (stage === 8) return ['PLAN-REVIEW'];
  if (stage === 9) return profile === 'Lite' ? ['TASK'] : ['TASKS-INDEX', 'TASK'];
  if (stage === 10) return ['TASK'];
  if (stage === 11) return ['IMPLEMENTATION-REVIEW'];
  return [];
}

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
      references: check.references,
    })),
  };
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
  const toolkit = buildToolkitDescriptor();

  return {
    protocolVersion: 2,
    initialized: true,
    toolkit,
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
    },
    workflow: diagnostics,
    stage: {
      number: stage,
      name: STAGES[stage] ?? 'Unknown stage',
      status: record.state.status,
      architectureDecision: record.state.architectureDecision,
    },
    execution: {
      kind: executionKind(record, diagnostics),
      prompt: STAGE_PROMPTS[stage] ? buildToolkitResource(STAGE_PROMPTS[stage], toolkit) : null,
      requiredResources: requiredResourcePathsForStage(stage)
        .map((path) => buildToolkitResource(path, toolkit)),
      primaryArtifactTypes: targets,
      artifacts: targetArtifacts.map((artifact) => ({
        id: artifact.id,
        type: artifact.type,
        path: artifact.path,
        status: artifact.status,
        baseline: artifact.baseline,
      })),
      sourceAdapterPolicy: 'Select the matching source adapter from the actual source; source format is not canonical record state in schema v2.',
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
    },
    nextAction: deriveNextAction(record),
  };
}
