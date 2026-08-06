# Executable Workflow Records

A workflow record provides a compact machine-readable control layer so CI and local tooling can detect inconsistent state before implementation or acceptance.

Projects choose one control mode:

- **CLI-managed:** the workflow record is canonical for mutable workflow-control state, and generated Markdown views provide human-readable indexes.
- **Markdown-only:** normal Markdown artifacts remain the manually maintained control records.

See [`../workflow/State-Ownership.md`](../workflow/State-Ownership.md).

For Express, `WORKPACK.md` remains the single normative narrative artifact. The record owns mutable control state only; it does not become a second product or design specification.

## File convention

Place one record at either:

```text
.workflow/workflow-record.json
```

or use a file ending in:

```text
*.workflow.json
```

The repository validator discovers those files automatically.

Use [`workflow-record.schema.json`](workflow-record.schema.json) for editor completion and basic structural validation. The semantic validator in [`../scripts/lib/validate-workflow-record.mjs`](../scripts/lib/validate-workflow-record.mjs) enforces relationships that JSON Schema alone cannot reliably express.

## What the record owns in CLI-managed mode

- selected profile and execution mode;
- current stage and status;
- active source inputs, current task, and latest output;
- source snapshot identity, state, pin strength, reference, and lineage;
- artifact inventory, status, baseline, and references;
- task status, prerequisites, references, validation state, and outputs.

The record does not replace:

- source scope, evidence, reproduction instructions, authority, or limitations;
- product requirements;
- visual and interaction rationale;
- behavioral specifications;
- architecture decisions;
- implementation-plan rationale;
- blocker detail, assumptions, exceptions, or narrative history;
- detailed validation evidence and final review prose.

Those remain in their owning Markdown artifacts or consolidated Express and Lite sections.

## Generated views

The CLI renders deterministic views beside the record:

```text
.workflow/generated/WORKFLOW-STATUS.md
.workflow/generated/SOURCE-INDEX.md
.workflow/generated/ARTIFACT-INDEX.md
.workflow/generated/TASK-INDEX.md
```

Every file includes a canonical SHA-256 digest of the record. The digest ignores object-key ordering but preserves meaningful array order.

Generated views are disposable and must not be edited manually.

```bash
design-workflow sync
design-workflow sync --check
design-workflow validate
```

The first command writes or repairs views. The second checks freshness without writing. The third checks both record semantics and generated-view freshness.

## Semantic and synchronization checks

Validation currently checks:

- identifier syntax and global uniqueness;
- references to missing snapshots or tasks;
- profile-required artifact presence;
- Express one-workpack and one-task constraints;
- Express rejection of separate larger-profile artifacts and task prerequisites;
- Lite-profile consolidation rules;
- task prerequisite cycles and self-dependencies;
- task-start and output repository snapshot relationships;
- implementation-output commit, parent, and producing-task lineage;
- complete-task output and validation requirements;
- evidence for passed validation;
- reasons for failed, blocked, skipped, or not-applicable validation;
- workflow completion and execution-mode consistency;
- missing or stale generated state views.

## Commands

Run repository and project-record validation:

```bash
node scripts/validate-workflow.mjs
```

Run focused tests:

```bash
node scripts/test-workflow-record.mjs
node scripts/test-generated-state.mjs
node scripts/test-cli.mjs
```

## Express example

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "Article preview card",
    "profile": "Express",
    "executionMode": "Task-by-task"
  },
  "state": {
    "stage": 9,
    "status": "Ready",
    "activeInputs": ["SRC-DS-001", "SRC-REPO-001"],
    "currentTask": "P01-T01",
    "latestOutput": null
  },
  "snapshots": [],
  "artifacts": [
    {
      "id": "ART-WORKPACK",
      "type": "WORKPACK",
      "status": "Approved",
      "baseline": []
    }
  ],
  "tasks": []
}
```

The shape above is structurally illustrative only. Semantic validation will correctly report missing snapshot definitions and the missing Express task from Stage 9 onward. See [`../tests/fixtures/workflow-record.express.valid.json`](../tests/fixtures/workflow-record.express.valid.json) for a complete valid record.

## Adoption strategy

Existing projects can continue using Markdown-only mode. To migrate:

1. reconcile duplicated values;
2. create or validate the workflow record;
3. run `design-workflow sync`;
4. replace copied operational tables with links to generated views;
5. retain narrative evidence, rationale, decisions, blockers, and history in their Markdown owners;
6. validate and commit the record and generated views together.
