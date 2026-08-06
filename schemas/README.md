# Executable Workflow Records

The Markdown artifacts remain the human-readable, normative project documentation. A workflow record adds a compact machine-readable control layer so CI and local tooling can detect inconsistent state before implementation or acceptance.

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

## What the record owns

The record is an executable projection of information already owned by the Markdown workflow artifacts:

- selected profile and execution mode;
- current stage and status;
- active source inputs;
- source snapshot identities and lineage;
- artifact inventory and baseline references;
- task status, prerequisites, references, validation, and outputs.

It must not replace design rationale, product requirements, behavioral specifications, architecture decisions, implementation plans, or validation evidence. Those remain in their owning Markdown artifacts.

## Semantic checks

The validator currently checks:

- identifier syntax and global uniqueness;
- references to missing snapshots or tasks;
- profile-required artifact presence;
- Lite-profile consolidation rules;
- task prerequisite cycles and self-dependencies;
- task-start and output repository snapshot relationships;
- implementation-output commit, parent, and producing-task lineage;
- complete-task output requirements;
- complete-task validation status;
- evidence for passed validation;
- reasons for failed, blocked, skipped, or not-applicable validation;
- workflow completion and execution-mode consistency.

## Commands

Run repository and project-record validation:

```bash
node scripts/validate-workflow.mjs
```

Run the semantic validator self-tests:

```bash
node scripts/test-workflow-record.mjs
```

## Minimal example

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "Pricing page",
    "profile": "Lite",
    "executionMode": "Task-by-task"
  },
  "state": {
    "stage": 10,
    "status": "In progress",
    "activeInputs": ["SRC-DS-001", "SRC-REPO-001"],
    "currentTask": "P01-T01",
    "latestOutput": null
  },
  "snapshots": [],
  "artifacts": [],
  "tasks": []
}
```

The minimal shape above is structurally illustrative only; semantic validation will correctly report missing snapshot definitions and profile artifacts.

## Adoption strategy

This is intentionally additive. Existing projects can continue using only Markdown. Add a workflow record when automated consistency checks are useful, then incrementally expand the record as tooling matures.
