# Implementation Task Template

Use this template to create one implementation task file. Name files with zero-padded phase and task numbers, such as `Phase-01--Task-01.md`.

A task must produce one coherent, independently verifiable result. Reference only snapshot IDs defined in `SOURCE-BASELINE.md`.

```yaml
---
artifact: TASK
id: P01-T01
status: Not started
baseline:
  design:
    - SRC-DS-001
  repository:
    - SRC-REPO-001
  runtime: []
  documentation:
    - SRC-DOC-001
  assets: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

# Phase 01 — Task 01: Task title

## 1. Status

`Not started`

Use the status vocabulary defined in `TASKS-INDEX.md`.

## 2. Objective

Describe the single concrete result this task must produce.

## 3. Source References

- Source baseline: `SOURCE-BASELINE.md`
- Design snapshots: `SRC-DS-*`
- Repository snapshot: `SRC-REPO-*`
- Runtime snapshots: `SRC-RUN-*` / None
- Documentation snapshots: `SRC-DOC-*` / None
- Asset snapshots: `SRC-ASSET-*` / None
- `PLAN.md`:
- `PLAN-REVIEW.md`:
- Requirement IDs:
- Specification IDs or sections:
- `DESIGN.md` references:
- Design-source evidence:
- `ARCHITECTURE.md` references, when applicable:
- Related tasks:

## 4. Snapshot Verification

Complete before implementation begins.

- Verification date and method:
- Design snapshot applicable: Yes / No / Unverified
- Repository commit available and checked out: Yes / No / Unverified
- Newer material source content detected: Yes / No / Unknown
- Rebaseline required: Yes / No
- Action or limitation:

Do not begin affected implementation when a material rebaseline is unresolved.

## 5. Prerequisites

List tasks, repository conditions, assets, decisions, access requirements, and required snapshot verification.

- ...

Use `None` when no prerequisite exists.

## 6. Scope

### Included

- Work required to produce the objective
- Relevant accessibility, responsive, state, error, and testing work

### Excluded

- Nearby work assigned to other tasks
- Deferred or unapproved capabilities
- Unrelated refactoring

## 7. Repository Context

Record current state at the pinned `SRC-REPO-*` commit:

- Existing files and modules
- Established patterns and conventions
- Reusable components, utilities, tokens, or tests
- Confirmed scripts and commands
- Constraints or technical debt

Distinguish observed existing paths from proposed paths and later branch changes.

## 8. Files and Modules

| Path | Action | Existing or proposed | Responsibility | Repository evidence |
|---|---|---|---|---|
| `path/to/file` | Create / Modify / Delete | Existing / Proposed | ... | `SRC-REPO-*` |

## 9. Dependencies and Interfaces

Document module and task dependencies, public interfaces, data or component contracts, compatibility requirements, and downstream effects.

## 10. Implementation Steps

1. Verify the relevant source snapshots.
2. Inspect affected files and confirm repository assumptions.
3. ...
4. Update relevant tests and documentation.
5. Run required validation.

Do not include implementation code during task decomposition.

## 11. State, Responsive, and Accessibility Requirements

### States and errors

- Default:
- Loading:
- Empty:
- Error:
- Success:
- Disabled or unavailable:
- Other:

### Responsive behavior

- Small viewports:
- Intermediate widths:
- Large viewports:
- Content and overflow edge cases:

### Accessibility

- Semantic structure:
- Keyboard interaction:
- Focus behavior:
- Accessible names and relationships:
- Announcements:
- Contrast, reflow, touch targets, or reduced motion:

Use `Not applicable` only with a reason.

## 12. Validation

List only commands and checks supported by the pinned repository snapshot.

### Automated validation

- Unit tests:
- Component or integration tests:
- End-to-end tests:
- Type checking:
- Linting:
- Build:
- Other:

### Manual validation

- Interaction checks:
- Responsive checks:
- Accessibility checks:
- Visual comparison against `SRC-DS-*`:
- Error and edge-case checks:
- Regression checks:

For each check, define the expected result. Do not claim a check passed until it ran successfully.

## 13. Acceptance Criteria

- [ ] `[Requirement or specification ID]` Objective result is observable and correct.
- [ ] Required accessibility behavior is verified.
- [ ] Required responsive and state behavior is verified.
- [ ] Relevant automated and manual validation passes.
- [ ] Snapshot verification or approved rebaseline is complete.
- [ ] Documentation and task status are updated.

## 14. Risks and Considerations

| Risk or assumption | Impact | Mitigation or validation |
|---|---|---|
| ... | ... | ... |

## 15. Implementation Discoveries

| Discovery | Impact | Owning artifact | Required update |
|---|---|---|---|
| ... | ... | `SOURCE-BASELINE.md` / `REQUIREMENTS.md` / `DESIGN.md` / `SPEC.md` / `ARCHITECTURE.md` / `PLAN.md` / Task | ... |

Do not silently work around documentation or source-baseline errors.

## 16. Deviations

| Planned approach or baseline | Actual approach or baseline | Reason | Approval or evidence | Impact |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

Use `None` when implementation followed the task exactly.

## 17. Definition of Done

- [ ] The objective is implemented within scope.
- [ ] Acceptance criteria pass.
- [ ] Required validation executed successfully.
- [ ] No required validation remains failing or unverified.
- [ ] Snapshot references remain valid or an approved rebaseline was completed.
- [ ] Relevant documentation was updated.
- [ ] `TASKS-INDEX.md` reflects current status.
- [ ] Deviations and remaining risks are recorded.
- [ ] Downstream tasks have the information they need.

## 18. Completion Report

- Files created, modified, or deleted:
- Snapshot IDs used:
- Source verification performed:
- Behavior implemented:
- Validation executed:
- Validation results:
- Deviations:
- Remaining risks:
- Documentation updated:
- Next unblocked task:
