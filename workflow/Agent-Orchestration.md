# Agent Orchestration

This document defines how an AI design-engineering agent operates the executable workflow without becoming a second workflow engine.

## Boundary

The agent owns reasoning, source inspection, artifact prose, implementation decisions within approved scope, and evidence collection. The CLI owns executable state, stage/task legality, canonical registries, generated views, trace definitions, validation state, implementation lineage, project-workspace resolution, and workflow-toolkit dependency resolution.

Never infer executable state from narrative Markdown when `.workflow/workflow-record.json` exists. Never manually edit generated views.

## Project and toolkit resolution

Treat the implementation project and workflow toolkit as separate namespaces.

The implementation project contains product source, narrative artifacts, and `.workflow/workflow-record.json`. Its workspace root is derived from the record location and reported as `project.root` in orchestration context. An absolute machine-specific project path is not persisted in the canonical record.

The workflow toolkit contains `prompts/`, `guidelines/`, `templates/`, `workflow/`, the CLI, and supporting workflow code. Schema-v2 records may persist a dedicated top-level toolkit dependency:

```json
{
  "toolkit": {
    "repository": "ferfalcon/figma-to-implementation-workflow",
    "revision": "<40-character-git-sha>"
  }
}
```

`repository` identifies the toolkit repository. `revision` is the immutable Git commit that governs workflow-resource resolution for the project.

Do not register the toolkit as a `SRC-*` project snapshot. `SRC-*` snapshots describe design/document/runtime inputs and implementation-project lineage; `toolkit` describes the workflow implementation that interprets that lineage.

New CLI-managed records pin the detected or explicitly supplied toolkit dependency in the same transaction that creates the workflow record. Existing schema-v2 records without `toolkit` remain valid for backward compatibility.

A short-lived earlier model stored toolkit identity in a `toolkit+github://` Supporting-source snapshot. The CLI recognizes that representation for compatibility. Convert it with:

```bash
design-workflow toolkit migrate
```

Migration preserves the repository and immutable commit while removing the toolkit snapshot from project source lineage when it is safe to do so.

## Handshake

Begin every CLI-managed workflow turn with:

```bash
design-workflow context --json
```

Treat the returned `protocolVersion` independently from the workflow record `schemaVersion`.

Initialized CLI-managed context payloads that expose the minimal resource manifest use protocol v2. Uninitialized/missing-record context remains a separate bootstrap path and does not imply the initialized protocol contract.

The context reports:

- project profile, execution mode, and resolved implementation workspace root;
- pinned workflow-toolkit repository and immutable revision when available;
- current stage and stage-local prompt, including a fully resolved `execution.promptSource` when the toolkit is pinned;
- the minimal workflow-resource manifest for the current stage;
- active source snapshots and latest verification;
- current target artifact types and registered artifact paths;
- current and Ready tasks;
- architecture/profile-transition state;
- workflow health and generated-view freshness;
- stage preflight;
- whether code edits are permitted;
- the next permitted action.

If no record exists, initialize first. If the record is schema v1, migrate before mutation. If context reports `repair`, repair record/generated state before continuing. If a profile upgrade is in progress, reconcile and finish it before ordinary advancement. If `toolkit.legacy` is true, migrate the toolkit binding before relying on remote toolkit resources.

### Toolkit dependency resolution

Inspect the current dependency with:

```bash
design-workflow toolkit show --json
```

Pin an existing unpinned workflow with:

```bash
design-workflow toolkit pin \
  --repository ferfalcon/figma-to-implementation-workflow \
  --revision <40-character-sha>
```

`--commit` remains accepted as a compatibility alias for `--revision`.

When `toolkit.pinned` is `true`, all workflow prompts, guidelines, templates, adapters, and normative workflow documents used for the turn must come from `toolkit.repository` at exactly `toolkit.revision`. Never fall back to `main`, another mutable ref, or whatever toolkit files happen to be newest.

Replacing a valid existing toolkit dependency is not an ordinary pin mutation. Toolkit upgrades must be explicit and preserve previous dependency identity rather than silently repointing the project.

## Minimal-read execution

For an initialized, healthy CLI-managed project, the context resource manifest is the workflow-reading boundary for the turn.

`execution.resources` has three groups:

- `required` — load these resources before performing the current stage responsibility;
- `onDemand` — load only when the resource's `when` condition applies, such as creating or restructuring the target artifact;
- `conditional` — choose the matching resource from the returned choices based on observed source format or another stated condition; do not load every choice.

When the toolkit dependency is present and unambiguous, returned resources include `location` with the exact `scope`, repository, revision, and path. Use that location instead of reconstructing a GitHub URL or falling back to a mutable ref.

Do not recursively inspect the toolkit or read `README.md`, `QUICKSTART.md`, `cli/README.md`, broad `workflow/` documentation, unrelated prompts, unrelated guidelines, unrelated templates, or every source adapter to rediscover how the workflow works.

Broader workflow reads are permitted only when one of these is true:

- the workflow is not initialized yet;
- context reports migration, repair, or profile-transition work that requires additional normative material;
- a required resource explicitly directs the agent to another normative resource;
- the user explicitly asks to inspect or modify the workflow toolkit itself.

The goal is deterministic startup: permanent agent contract → `context --json` → current required resources → work.

## Stage-local execution

Load the prompt returned in `execution.prompt`; it is also listed in `execution.resources.required`. The relative `execution.prompt` field remains for compatibility. When `execution.promptSource` or a resource `location` is present, use its toolkit scope, repository, revision, and path as the authoritative remote lookup instead of assuming the path belongs to the implementation project or reconstructing a GitHub location yourself. Perform only the responsibility of the current stage.

Use the profile targets returned by `execution.primaryArtifactTypes`:

- Express keeps all narrative reasoning in `WORKPACK.md`;
- Lite uses `IMPLEMENTATION-BRIEF.md` for consolidated Stages 2–8 and separate source/audit/task/final-review artifacts;
- Standard uses separate core artifacts and conditional architecture;
- Full uses the complete separate artifact set including architecture.

The prompt determines what reasoning belongs in the target artifact. The workflow record remains the owner of mutable status, registry, validation-result, and lineage fields.

Use stage-specific guidelines only when returned in `execution.resources.required`. Templates are references, not mandatory reads on every turn; load the returned template only when its `onDemand.when` condition applies.

Select the relevant source adapter from the actual source using `execution.resources.conditional`. Schema v2 does not canonically record whether `SRC-DS-*` represents Figma, screenshots, PDF, an existing website, or mixed sources, so do not guess a source adapter from an ID alone and do not browse all adapters.

## Stage preflight

Before proposing a stage decision, run:

```bash
design-workflow stage check --json
```

`stage check` is read-only. It evaluates whether a structurally valid stage decision can be recorded and whether an already-recorded passing decision can advance.

- `Passed` means the structural exit contract can be satisfied.
- `Must upgrade` is recommended when the current profile cannot legally continue, such as Express/Lite with required architecture.
- `Passed with assumptions` is never selected automatically; an agent or human must explicitly justify the assumption.
- A Gated workflow still requires a real human approval actor before a passing decision is recorded.

Do not treat preflight success as evidence that the narrative or design reasoning is substantively correct. The agent must perform the required two review passes first.

## Execution modes

### Gated

Complete the current stage and preflight it. Stop for explicit human approval before recording a passing gate or advancing. Never invent `--approved-by` or treat agent confidence as human approval.

### Continuous documentation

Continue through documentation, consistency review, architecture decision, planning, plan review, and task decomposition while unblocked. Stop at Stage 9. The CLI must not enter Stage 10 in this mode.

### Task-by-task

Use only after task decomposition. At Stage 10 select one unblocked Ready task whose prerequisites are complete, start it through the CLI, implement only that task, run required validation, commit, complete the task, and stop before beginning another task unless the workflow/user explicitly continues.

## Code-edit boundary

Implementation code may be edited only when context reports:

```text
policy.codeEdits = allowed-with-current-task-scope
```

This requires Stage 10, a structurally clean schema-v2 workflow, and an execution mode that permits implementation. Outside Stage 10, source/repository inspection is allowed but implementation edits are not.

## Source and lineage safety

Verify relevant active snapshots before stage closure and before task execution. Unexpected material upstream/concurrent changes block affected work and require a new snapshot or explicit impact assessment. Expected previous-task outputs advance repository lineage without replacing the original project input baseline.

The toolkit dependency is separate from implementation-source lineage. Do not add it to artifact baselines, task baselines, or `state.activeInputs` merely because it governs workflow execution.

## Narrative ownership during implementation

Task/workpack Markdown owns:

- implementation discoveries;
- deviations and their rationale;
- affected-file/behavior narrative;
- risks and follow-up documentation changes.

The workflow record owns:

- current task status;
- structured validation result/status/evidence fields;
- output snapshot identity;
- output commit SHA;
- task/output parent lineage.

Do not duplicate record-owned mutable values in CLI-managed narrative sections.

## Completion loop

After every meaningful workflow mutation, the CLI updates generated views transactionally. Before claiming readiness or completion, run the relevant preflight plus `design-workflow validate` or `design-workflow sync --check` as required.

Final acceptance remains Stage 11 work against exact source snapshots, approved narrative artifacts, implementation-output snapshot/commit, and validation runtime when applicable.
