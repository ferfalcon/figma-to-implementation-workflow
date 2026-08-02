# Implementation Task Template

Use this template to create one implementation task file.

Name task files with zero-padded phase and task numbers, such as `Phase-01--Task-01.md`.

A task must produce one coherent, independently verifiable result. Do not include implementation code during task decomposition.

# Phase 01 — Task 01: Task title

## 1. Status

`Not started`

Use the same status vocabulary defined in `TASKS-INDEX.md`.

## 2. Objective

Describe the single concrete result this task must produce.

## 3. Source References

- `PLAN.md`:
- `PLAN-REVIEW.md`:
- Requirement IDs:
- Specification IDs or sections:
- `DESIGN.md` references:
- Design-source evidence:
- `ARCHITECTURE.md` references, when applicable:
- Related tasks:

## 4. Prerequisites

List tasks, repository conditions, assets, decisions, or access requirements that must be satisfied before implementation begins.

- ...

Use `None` when no prerequisite exists.

## 5. Scope

### Included

- Work required to produce the objective
- Relevant accessibility, responsive, state, error, and testing work

### Excluded

- Nearby work assigned to other tasks
- Deferred or unapproved capabilities
- Unrelated refactoring

## 6. Repository Context

Record the relevant current repository state before implementation:

- Existing files and modules
- Established patterns and conventions
- Reusable components, utilities, tokens, or tests
- Confirmed scripts and commands
- Constraints or technical debt

Distinguish observed existing paths from proposed new paths.

## 7. Files and Modules

| Path | Action | Existing or proposed | Responsibility |
|---|---|---|---|
| `path/to/file` | Create / Modify / Delete | Existing / Proposed | ... |

Mark unresolved locations explicitly instead of inventing them.

## 8. Dependencies and Interfaces

Document:

- modules or tasks this work depends on;
- public interfaces it creates or changes;
- data, API, component, or design-system contracts affected;
- compatibility requirements;
- downstream tasks affected.

## 9. Implementation Steps

1. Inspect the affected files and confirm repository assumptions.
2. ...
3. ...
4. Update relevant tests and documentation.
5. Run the required validation.

Steps must be concrete and ordered, but should not contain implementation code.

## 10. State, Responsive, and Accessibility Requirements

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

## 11. Validation

List only commands and checks supported by the repository.

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
- Visual comparison:
- Error and edge-case checks:
- Regression checks:

For each check, define the expected result. Do not claim a check passed until it was run successfully.

## 12. Acceptance Criteria

Link every material criterion to its source.

- [ ] `[Requirement or specification ID]` Objective result is observable and correct.
- [ ] ...
- [ ] Required accessibility behavior is verified.
- [ ] Required responsive and state behavior is verified.
- [ ] Relevant automated and manual validation passes.
- [ ] Documentation and task status are updated.

## 13. Risks and Considerations

| Risk or assumption | Impact | Mitigation or validation |
|---|---|---|
| ... | ... | ... |

Include likely regressions, migration concerns, compatibility issues, and unresolved repository assumptions.

## 14. Implementation Discoveries

Complete this section during implementation.

| Discovery | Impact | Owning document | Required update |
|---|---|---|---|
| ... | ... | `REQUIREMENTS.md` / `DESIGN.md` / `SPEC.md` / `ARCHITECTURE.md` / `PLAN.md` / Task | ... |

Do not silently work around documentation errors.

## 15. Deviations

Complete this section during implementation.

| Planned approach | Actual approach | Reason | Approval or evidence | Impact |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

Use `None` when implementation followed the task exactly.

## 16. Definition of Done

This task is complete only when:

- [ ] The objective is implemented within the defined scope.
- [ ] Acceptance criteria pass.
- [ ] Required validation was executed successfully.
- [ ] No required validation remains failing or unverified.
- [ ] Relevant documentation was updated.
- [ ] `TASKS-INDEX.md` reflects the current status.
- [ ] Deviations and remaining risks are recorded.
- [ ] Downstream tasks have the information they need.

## 17. Completion Report

Complete this section before marking the task complete.

- Files created, modified, or deleted:
- Behavior implemented:
- Validation executed:
- Validation results:
- Deviations:
- Remaining risks:
- Documentation updated:
- Next unblocked task:
