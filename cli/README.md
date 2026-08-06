# Design Workflow CLI

The CLI maintains `.workflow/workflow-record.json` as the canonical mutable workflow-control record, generates profile-appropriate Markdown artifacts, produces deterministic human-readable state views, and applies the same validation used by repository CI.

See [`../workflow/State-Ownership.md`](../workflow/State-Ownership.md) for the ownership model.

## Run locally

```bash
node cli/design-workflow.mjs help
```

After packaging or installation:

```bash
npx @ferfalcon/design-workflow help
```

## Initialize a project

```bash
npx @ferfalcon/design-workflow init \
  --name "Article preview component" \
  --profile Express \
  --mode Gated \
  --design "https://www.figma.com/design/..." \
  --repository .
```

`init` creates the workflow record, profile-required Markdown artifacts, and these generated state views:

```text
.workflow/generated/WORKFLOW-STATUS.md
.workflow/generated/SOURCE-INDEX.md
.workflow/generated/ARTIFACT-INDEX.md
.workflow/generated/TASK-INDEX.md
```

Task-by-task mode cannot begin at Stage 0. Initialize with `Gated` or `Continuous documentation`, reach Stage 9, then switch modes.

## Canonical state and generated views

The record owns mutable profile, execution mode, stage, status, active inputs, snapshots, artifact inventory, task lifecycle, validation state, and implementation-output lineage.

Generated views are deterministic projections of that record. Do not edit them manually. Every CLI mutation synchronizes them automatically.

Repair or regenerate views after a direct JSON edit:

```bash
design-workflow sync
```

Check freshness without changing files:

```bash
design-workflow sync --check
```

`design-workflow validate` checks both semantic validity and generated-view freshness.

## Commands

### Inspect control state

```bash
design-workflow status
design-workflow status --json
design-workflow next
design-workflow sync --check
design-workflow validate
```

### Change stage or execution mode

```bash
design-workflow stage set 9 --status "In progress"
design-workflow mode set "Task-by-task"
```

Stage changes are explicit. `next` reports the next permitted action but does not silently advance the workflow.

### Add source snapshots

```bash
design-workflow snapshot add \
  --kind design \
  --reference "Figma node 41:22 inspected 2026-08-06T13:00:00-03:00" \
  --activate

design-workflow snapshot add \
  --kind repo \
  --reference "Implementation repository baseline" \
  --commit 1111111111111111111111111111111111111111 \
  --activate
```

Supported kinds are `design`, `repo`, `runtime`, `doc`, and `asset`. IDs are allocated automatically unless `--id` is supplied.

Detailed source scope, evidence, reproduction information, authority, and limitations remain in `SOURCE-BASELINE.md` or `WORKPACK.md`; the record owns the mutable registry fields.

### Create artifacts

```bash
design-workflow artifact create design
design-workflow artifact create plan --baseline SRC-DS-001,SRC-REPO-001
```

The matching template is copied into the current project. Express projects reject separate artifacts because their responsibilities remain consolidated in `WORKPACK.md`.

### Manage tasks

```bash
design-workflow task create \
  --title "Implement article preview card" \
  --references REQ-FR-001,SPEC-BEH-001,AC-001

design-workflow task start P01-T01
design-workflow task complete P01-T01 \
  --commit 2222222222222222222222222222222222222222 \
  --check "Build=npm run build completed successfully" \
  --check "Keyboard=manual keyboard review passed"
```

Non-Express profiles receive a task file generated from `TASK.template.md`. Express keeps its single task inside `WORKPACK.md` while still recording task state and output lineage in the workflow record.

`task complete` creates the Implementation output snapshot automatically. Every completed task requires at least one passed or explicitly not-applicable validation result.

Use `--na "Check name=reason"` only when a check genuinely does not apply.

### Trace identifiers

```bash
design-workflow trace REQ-FR-001
design-workflow trace SRC-REPO-002
```

The command reports artifacts, tasks, snapshots, and control-state fields that reference the identifier.

## Record location

The default record is:

```text
.workflow/workflow-record.json
```

Generated views are placed in the `generated/` directory beside the selected record. Use `--record path/to/record.json` with any command to override the default.

## Version-control behavior

In CLI-managed projects, commit the record and generated views together. CI can run:

```bash
design-workflow sync --check
design-workflow validate
```

A stale or missing generated file is a validation failure. Generated views are disposable and can always be recreated from the record.

## Safety behavior

- Existing records are not replaced without `init --force`.
- Express cannot silently expand into a multi-artifact or multi-task workflow.
- Task prerequisites must be complete before task start.
- A second current task cannot be started.
- Completion requires a full Git SHA and resolved validation.
- Passed validation requires evidence.
- Generated views cannot silently diverge from the record.
- Semantic or synchronization findings produce a non-zero exit code for CI use.
