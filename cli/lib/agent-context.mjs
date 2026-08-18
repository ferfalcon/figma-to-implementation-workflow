import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTIFACT_FILES } from './workflow-model.mjs';
import { buildOrchestrationContext } from './orchestration-context.mjs';
import { runtimeToolkitPin } from './toolkit-source.mjs';
import { relativeDisplay } from './utils.mjs';

export const AGENT_PROTOCOL_VERSION = 2;

export const STAGE_GUIDANCE = {
  2: 'guidelines/REQUIREMENTS.md',
  3: 'guidelines/DESIGN.md',
  4: 'guidelines/SPEC.md',
  6: 'guidelines/ARCHITECTURE.md',
  7: 'guidelines/PLAN.md',
};

const TOOLKIT_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const NON_STAGE_EXECUTION_KINDS = new Set(['migration', 'repair']);

function pinnedSource(context, path) {
  const toolkit = context.toolkit;
  if (!toolkit?.pinned || toolkit.ambiguous) return null;
  return {
    repository: toolkit.repository,
    version: toolkit.version,
    commit: toolkit.commit,
    path,
  };
}

function localToolkitMatches(context) {
  if (!context.toolkit?.pinned) return true;
  if (context.toolkit.ambiguous) return false;
  const runtime = runtimeToolkitPin();
  return Boolean(
    runtime
    && runtime.repository === context.toolkit.repository
    && runtime.commit === context.toolkit.commit,
  );
}

function resolvedResource(context, path, metadata = {}) {
  const source = pinnedSource(context, path);
  const embed = localToolkitMatches(context);
  return {
    ...metadata,
    path,
    source,
    resolution: embed ? 'embedded' : (context.toolkit?.ambiguous ? 'repair-toolkit-pin' : 'pinned-source-required'),
    content: embed ? readFileSync(resolve(TOOLKIT_ROOT, path), 'utf8') : null,
  };
}

export function agentResourcesForContext(context) {
  if (NON_STAGE_EXECUTION_KINDS.has(context.execution.kind)) {
    return { stagePrompt: null, guidance: [], templates: [] };
  }

  const guidancePath = STAGE_GUIDANCE[context.stage.number] ?? null;
  const registeredTypes = new Set(context.execution.artifacts.map((artifact) => artifact.type));
  const templates = context.execution.primaryArtifactTypes
    .filter((type) => !registeredTypes.has(type))
    .map((type) => {
      const templateName = ARTIFACT_FILES[type]?.[1] ?? null;
      return templateName
        ? resolvedResource(context, `templates/${templateName}`, { artifactType: type })
        : null;
    })
    .filter(Boolean);

  return {
    stagePrompt: context.execution.prompt
      ? resolvedResource(context, context.execution.prompt)
      : null,
    guidance: guidancePath ? [resolvedResource(context, guidancePath)] : [],
    templates,
  };
}

function fullCurrentTask(record) {
  if (!record.state.currentTask) return null;
  return record.tasks.find((task) => task.id === record.state.currentTask) ?? null;
}

export function composeAgentContext(context, record) {
  return {
    protocolVersion: AGENT_PROTOCOL_VERSION,
    initialized: true,
    control: context.control,
    project: context.project,
    toolkit: context.toolkit,
    workflow: context.workflow,
    state: {
      profile: context.project.profile,
      mode: context.project.executionMode,
      stage: context.stage.number,
      stageName: context.stage.name,
      stageStatus: context.stage.status,
      executionKind: context.execution.kind,
      architectureDecision: context.stage.architectureDecision,
      profileTransition: context.profileTransition,
    },
    policy: context.policy,
    task: {
      instruction: context.nextAction,
      artifactTypes: context.execution.primaryArtifactTypes,
      artifacts: context.execution.artifacts,
      current: fullCurrentTask(record),
      ready: context.tasks.ready,
      nextReady: context.tasks.nextReady,
    },
    sources: context.sources,
    stageCheck: context.stageCheck,
    resources: {
      ...agentResourcesForContext(context),
      sourceAdapterPolicy: context.execution.sourceAdapterPolicy,
    },
    nextAction: context.nextAction,
  };
}

export function buildAgentContext(recordPath, record, { cwd }) {
  const context = buildOrchestrationContext(recordPath, record, { cwd });
  return composeAgentContext(context, record);
}

export function buildAgentContextWhenMissing(recordPath, { cwd }) {
  const nextAction = 'Initialize the workflow before auditing, planning, or implementation.';
  const initializationContext = { toolkit: { pinned: false, ambiguous: false } };

  return {
    protocolVersion: AGENT_PROTOCOL_VERSION,
    initialized: false,
    control: {
      mode: null,
      schemaVersion: null,
      readOnly: false,
      record: relativeDisplay(cwd, recordPath),
    },
    project: null,
    toolkit: { pinned: false, repository: null, version: null, commit: null, snapshot: null, ambiguous: false },
    workflow: { valid: true, findings: [] },
    state: {
      profile: null,
      mode: null,
      stage: null,
      stageName: null,
      stageStatus: 'Not initialized',
      executionKind: 'initialization',
      architectureDecision: null,
      profileTransition: null,
    },
    policy: {
      workflowMutation: 'initialize-first',
      implementation: 'forbidden',
      codeEdits: 'forbidden',
      stageDecision: 'not-applicable',
      generatedViews: 'not-initialized',
    },
    task: {
      instruction: nextAction,
      artifactTypes: [],
      artifacts: [],
      current: null,
      ready: [],
      nextReady: null,
    },
    sources: { active: [], latestOutput: null, latestValidationRuntime: null },
    stageCheck: null,
    resources: {
      stagePrompt: resolvedResource(initializationContext, 'prompts/00-intake.md'),
      guidance: [],
      templates: [],
      sourceAdapterPolicy: 'Select the matching source adapter after the actual design source is identified.',
    },
    nextAction,
  };
}
