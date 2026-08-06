# Design Workflow CLI

The CLI maintains `.workflow/workflow-record.json`, generates profile-appropriate Markdown artifacts from the toolkit templates, and applies the same semantic validator used by repository CI.

## Run locally

From this toolkit repository:

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

`init` creates the machine-readable record and only the Markdown artifacts required by the selected profile. Repository input is pinned to the current Git commit when `--repository` is supplied.

Task-by-task mode cannot begin at Stage 0. Initialize with `Gated` or `Continuous documentation`, reach Stage 9, then switch modes.

## Commands

### Inspect control state

```bash
design-workflow status
design-workflow status --json
design-workflow next
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

Use `--record path/to/record.json` with any command to override it.

## Safety behavior

- Existing records are not replaced without `init --force`.
- Express cannot silently expand into a multi-artifact or multi-task workflow.
- Task prerequisites must be complete before task start.
- A second current task cannot be started.
- Completion requires a full Git SHA and resolved validation.
- Passed validation requires evidence.
- Semantic findings produce a non-zero exit code for CI use.
