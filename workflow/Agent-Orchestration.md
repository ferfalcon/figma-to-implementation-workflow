# Agent Orchestration

This document defines how an AI design-engineering agent operates the executable workflow without becoming a second workflow engine.

## Boundary

The agent owns reasoning, source inspection, artifact prose, implementation decisions within approved scope, and evidence collection. The CLI owns executable state, stage/task legality, canonical registries, generated views, trace definitions, validation state, and implementation lineage.

Never infer executable state from narrative Markdown when `.workflow/workflow-record.json` exists. Never manually edit generated views.

## Handshake

Begin every CLI-managed workflow turn with:

```bash
design-workflow context --json
```

Treat the returned `protocolVersion` independently from the workflow record `schemaVersion`.

The context reports:

- project profile and execution mode;
- current stage and stage-local prompt;
- active source snapshots and latest verification;
- current target artifact types and registered artifact paths;
- current and Ready tasks;
- architecture/profile-transition state;
- workflow health and generated-view freshness;
- stage preflight;
- whether code edits are permitted;
- the next permitted action.

If no record exists, initialize first. If the record is schema v1, migrate before mutation. If context reports `repair`, repair record/generated state before continuing. If a profile upgrade is in progress, reconcile and finish it before ordinary advancement.

## Stage-local execution

Load the prompt returned in `execution.prompt`. Perform only the responsibility of the current stage.

Use the profile targets returned by `execution.primaryArtifactTypes`:

- Express keeps all narrative reasoning in `WORKPACK.md`;
- Lite uses `IMPLEMENTATION-BRIEF.md` for consolidated Stages 2–8 and separate source/audit/task/final-review artifacts;
- Standard uses separate core artifacts and conditional architecture;
- Full uses the complete separate artifact set including architecture.

The prompt determines what reasoning belongs in the target artifact. The workflow record remains the owner of mutable status, registry, validation-result, and lineage fields.

Select the relevant source adapter from the actual source. Schema v2 does not canonically record whether `SRC-DS-*` represents Figma, screenshots, PDF, an existing website, or mixed sources, so do not guess a source adapter from an ID alone.

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
