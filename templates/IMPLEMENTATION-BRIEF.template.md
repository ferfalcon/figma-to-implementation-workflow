# Implementation Brief Template

Use this template only with the Lite profile. It consolidates requirements, design intent, specification, and planning while preserving their ownership boundaries and identifier namespaces.

# Implementation Brief

## 1. Document Information

- Status: Draft
- Scope:
- Last updated:
- Project context: `PROJECT-CONTEXT.md`
- Evidence baseline: `DESIGN-AUDIT.md`
- Repository baseline:

## 2. Requirements

### Goals and non-goals

- ...

### REQ-FR-001 — Requirement title

- Classification:
- Priority:
- Description:
- Evidence:
- Acceptance criteria:

Record applicable `REQ-AR-*`, `REQ-NFR-*`, `REQ-CON-*`, and other requirement types separately.

## 3. Design Intent

### DES-001 — Design decision title

- Classification:
- Intent:
- Evidence:
- Requirement references:

### Responsive and interaction intent

Use `DES-RWD-*` and `DES-INT-*` identifiers. Document supplied viewport evidence, behavior between examples, states, content edge cases, and accessibility intent.

## 4. Specification

### SPEC-BEH-001 — Behavior title

- Requirement and design references:
- Observable behavior:
- States and edge cases:
- Acceptance criteria: `AC-*`

Record applicable `SPEC-INT-*`, `SPEC-ACC-*`, `SPEC-VAL-*`, and `SPEC-DATA-*` items separately.

Do not invent arbitrary breakpoints, focus behavior, thresholds, or unsupported business rules.

## 5. Repository Context

- Existing files and conventions:
- Reusable components, tokens, utilities, and tests:
- Confirmed commands:
- Constraints and technical debt:

Distinguish observed paths from proposed paths.

## 6. Implementation Plan

### PLAN-001 — Plan item title

- Objective:
- Requirement and specification references:
- Files and modules:
- Dependencies:
- Implementation steps:
- Integrated accessibility, responsive, state, error, and test work:
- Validation:

Do not create a separate late accessibility implementation phase.

## 7. Architecture Decision

- Separate architecture needed: Yes / No
- Reason:

If the work requires meaningful routing, shared state, persistence, authentication, integrations, deployment, security, privacy, or migration decisions, upgrade to Standard or Full rather than overloading this brief.

## 8. Risks, Assumptions, and Questions

### Blocking

- ...

### Non-blocking

- ...

## 9. Traceability

| Evidence | Requirement | Design | Specification or criterion | Plan item | Validation |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## 10. Review Pass 1 — Completeness and Correctness

- [ ] Scope and repository context are accurate.
- [ ] Requirements, design intent, testable behavior, and implementation planning are complete for the Lite scope.
- [ ] Responsive, accessibility, states, errors, content edge cases, and validation are integrated.
- [ ] The work still qualifies for Lite.

## 11. Corrections from Pass 1

- ...

## 12. Review Pass 2 — Consistency, Traceability, Risks, and Uncertainty

- [ ] Ownership sections and identifiers remain distinct.
- [ ] Every material plan item maps to approved requirements or specifications.
- [ ] No unsupported scope or assumption is presented as confirmed.
- [ ] Blocking questions are visible.
- [ ] Corrections from the first pass were included before this review.

## 13. Readiness

Select exactly one:

- `Ready for task decomposition`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`
