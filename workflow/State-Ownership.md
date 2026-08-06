# Workflow State Ownership

This document prevents mutable workflow state from being maintained independently in several files.

The workflow supports two control modes:

- **CLI-managed mode:** `.workflow/workflow-record.json` is the canonical mutable control record. Markdown status and index files under `.workflow/generated/` are derived views.
- **Markdown-only mode:** projects that do not use the machine-readable record maintain operational state manually in the normal Markdown artifacts.

Do not mix the two modes for the same state field. When a workflow record exists, its managed fields are authoritative.

## Canonical ownership in CLI-managed mode

| Information | Canonical owner | Human-readable view |
|---|---|---|
| Profile and execution mode | `workflow-record.json` | `generated/WORKFLOW-STATUS.md` |
| Current stage and workflow status | `workflow-record.json` | `generated/WORKFLOW-STATUS.md` |
| Active input snapshots, current task, and latest output | `workflow-record.json` | `generated/WORKFLOW-STATUS.md` |
| Snapshot ID, role, status, pin strength, reference, commit, parent, and producing task | `workflow-record.json` | `generated/SOURCE-INDEX.md` |
| Artifact ID, type, status, baseline, and references | `workflow-record.json` | `generated/ARTIFACT-INDEX.md` |
| Task ID, status, baseline, prerequisites, references, output, and validation result state | `workflow-record.json` | `generated/TASK-INDEX.md` |
| Source scope, evidence, reproduction details, and limitations | `SOURCE-BASELINE.md`, `WORKPACK.md`, or the relevant source artifact | Not generated |
| Product, design, behavioral, architecture, and implementation rationale | The matching normative Markdown artifact | Not generated |
| Blocking questions, assumptions, decisions, and narrative history not represented by the record | `WORKFLOW-STATE.md` or `WORKPACK.md` | Not generated |
| Detailed task objective, implementation steps, risk, and completion narrative | Task file or `WORKPACK.md` | Not generated |

Generated files are not independent artifacts and must never become decision owners.

## Generated views

The CLI generates:

```text
.workflow/generated/WORKFLOW-STATUS.md
.workflow/generated/SOURCE-INDEX.md
.workflow/generated/ARTIFACT-INDEX.md
.workflow/generated/TASK-INDEX.md
```

Each file contains:

- a generated-file warning;
- the source record name;
- a canonical SHA-256 digest of the record;
- a deterministic Markdown view of the relevant state.

The digest ignores object-key ordering but preserves meaningful array order. A record change or manual edit makes the generated view stale.

## Mutation rules

1. Change managed state through `design-workflow` commands or by intentionally editing the workflow record.
2. Run `design-workflow sync` after any direct record edit.
3. Never manually edit a generated view.
4. Commit the workflow record and generated views together when the project stores workflow controls in version control.
5. Run `design-workflow sync --check` or `design-workflow validate` in CI.
6. Treat a missing or stale generated view as a validation failure, not as an alternative source of truth.

All CLI commands that mutate the workflow record synchronize generated views automatically.

## Markdown artifact rules

When CLI-managed mode is active:

- `WORKFLOW-STATE.md` owns blockers, assumptions, decisions, history, and other narrative control information not represented by the record. It links to generated status rather than copying current stage, mode, task, or output values.
- `SOURCE-BASELINE.md` owns detailed source scope, evidence, access, reproduction, authority, and limitations. It links to the generated source index rather than maintaining a second mutable snapshot registry.
- `TASKS-INDEX.md` owns phase rationale, coverage, coordination, and blockers. It links to the generated task index rather than copying task status, prerequisites, baseline, and output fields.
- Artifact prose may reference IDs but must not redefine record-owned status or lineage.

In Markdown-only mode, the fallback tables in those templates remain the operational source of truth.

## Synchronization commands

Write or repair generated views:

```bash
design-workflow sync
```

Check freshness without modifying files:

```bash
design-workflow sync --check
```

Validate both workflow semantics and generated-view freshness:

```bash
design-workflow validate
```

## Migration from duplicated state

1. Create or validate `.workflow/workflow-record.json`.
2. Reconcile conflicting copies before choosing canonical values.
3. Run `design-workflow sync`.
4. Replace repeated operational tables with links to the generated views.
5. Preserve rationale, evidence, decisions, blockers, and historical context in their Markdown owners.
6. Run validation and review the generated files.
7. Do not delete historical information merely because current status moved into the record.

## Review checklist

- [ ] Every mutable control field has exactly one owner.
- [ ] Generated views match the current record.
- [ ] No generated file contains manual decisions or rationale.
- [ ] Markdown artifacts retain evidence and context that the record cannot represent.
- [ ] Snapshot and implementation lineage are not repeated with conflicting values.
- [ ] Task status and dependencies are not manually synchronized in multiple indexes.
- [ ] CI detects stale or missing generated views.
