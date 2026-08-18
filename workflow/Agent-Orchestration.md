# Agent Orchestration

This document defines how an AI design-engineering agent operates the executable workflow without becoming a second workflow engine.

## Boundary

The agent owns reasoning, source inspection, artifact prose, implementation decisions within approved scope, and evidence collection. The CLI owns executable state, stage/task legality, canonical registries, generated views, trace definitions, validation state, implementation lineage, the recorded workflow-toolkit source pin, and selection of workflow resources for the current turn.

Never infer executable state from narrative Markdown when `.workflow/workflow-record.json` exists. Never manually edit generated views.

## Agent packet handshake

Begin every CLI-managed workflow turn with:

```bash
design-workflow agent-context --json
```

`design-workflow context --agent --json` is an equivalent alias. The packet uses `protocolVersion: 2`; treat that independently from the workflow record `schemaVersion`.

The packet is the preferred agent bootstrap because it returns resolved operational state plus the workflow resources required for the current turn. It reports:

- project profile and execution mode;
- the pinned workflow-toolkit repository, package version, commit, and source snapshot when available;
- current stage, execution kind, and policy;
- active source snapshots and latest verification;
- current target artifact types and registered artifact paths;
- the full current task plus Ready-task summaries;
- architecture/profile-transition state;
- workflow health and generated-view freshness;
- stage preflight and whether code edits are permitted;
- the next permitted action;
- the resolved stage prompt, stage-specific guidance, and any template required for a missing target artifact.

The lower-level compatibility handshake remains available:

```bash
design-workflow context --json
```

That protocol-v1 command exposes resolved state and resource paths but does not build the protocol-v2 turn packet. Prefer it for diagnostics and existing integrations.

If no record exists, the packet embeds the intake prompt and instructs initialization. If the record is schema v1, migrate before mutation. If the packet reports `repair`, repair record/generated state before continuing. Migration and repair packets intentionally withhold ordinary stage resources.

### Toolkit source resolution

The workflow toolkit is itself an execution dependency. For projects that consume workflow resources from GitHub or another remote package source, pin the toolkit to an exact commit rather than treating `main`, a branch, or a package version alone as operational identity.

A CLI-managed pin is recorded as an immutable `Supporting source` snapshot with a `toolkit+github://` reference and an exact 40-character commit SHA. It is intentionally not added to `state.activeInputs`: it governs workflow execution, not the product/design implementation baseline.

Inspect the current pin with:

```bash
design-workflow toolkit show --json
```

Pin an existing unpinned workflow with:

```bash
design-workflow toolkit pin \
  --repository ferfalcon/figma-to-implementation-workflow \
  --version 0.3.0 \
  --commit <40-character-sha>
```

When `toolkit.pinned` is `true`, all workflow prompts, guidelines, templates, adapters, and normative workflow documents used for the turn must come from `toolkit.repository` at exactly `toolkit.commit`. Never fall back to `main` or another mutable ref. A package version is descriptive metadata; the commit is the immutable operational pin.

The agent packet enforces this boundary. If the installed toolkit runtime matches the recorded repository and commit, selected resource content is returned with `resolution: embedded`. If it does not match, the packet does not embed potentially incorrect content; it returns `resolution: pinned-source-required` together with the exact `source.repository`, `source.commit`, and `source.path`. Fetch that exact source. If multiple toolkit pins are active, repair the ambiguity before ordinary workflow execution.

Replacing a valid existing pin is not an ordinary mutation; toolkit upgrades must be explicit and preserve the old pin as history.

## Zero-discovery execution rule

For a valid CLI-managed workflow, do not recursively inspect this toolkit to rediscover the procedure. Do not walk `README.md`, `QUICKSTART.md`, `workflow/`, `prompts/`, `guidelines/`, or `templates/` after receiving a protocol-v2 packet.

Consume:

- `resources.stagePrompt` as the stage-local procedure;
- `resources.guidance[*]` as stage-specific artifact guidance;
- `resources.templates[*]` only when the CLI determines a target artifact is missing;
- `resources.sourceAdapterPolicy` when deciding how to inspect the actual design source.

For each resolved resource, use `content` when `resolution` is `embedded`. When `resolution` is `pinned-source-required`, load the exact returned `source` instead of discovering a path or mutable ref yourself.

This keeps GitHub/package storage as the toolkit source of truth while making the CLI the resolver. The agent should reason about design and implementation, not about where workflow instructions live.

## Stage-local execution

Perform only the responsibility of the current stage described by the resolved stage prompt.

Use `task.artifactTypes` and `task.artifacts` from the packet:

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

Implementation code may be edited only when the agent packet reports:

```text
policy.codeEdits = allowed-with-current-task-scope
```

This requires Stage 10, a structurally clean schema-v2 workflow, and an execution mode that permits implementation. Outside Stage 10, source/repository inspection is allowed but implementation edits are not.

## Source and lineage safety

Verify relevant active snapshots before stage closure and before task execution. Unexpected material upstream/concurrent changes block affected work and require a new snapshot or explicit impact assessment. Expected previous-task outputs advance repository lineage without replacing the original project input baseline.

The toolkit pin is separate from implementation-source lineage. Do not add the toolkit snapshot to artifact baselines or task baselines merely because it is recorded in `snapshots`; use it only to resolve the workflow rules/resources governing the project.

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
