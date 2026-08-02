# Plan Review Template

Use this template to create a project-specific `PLAN-REVIEW.md`.

This document records an adversarial review of `PLAN.md`. Correct the plan directly when evidence supports a change, then record the finding, impact, correction, and remaining risk here.

# Plan Review

## 1. Document Information

- Status: In progress
- Review date: YYYY-MM-DD
- Reviewer:
- Project:
- Reviewed `PLAN.md` version or commit:

## 2. Review Sources

- `PLAN.md`
- `PLAN-REVIEW.md`, when updating an existing review
- `REQUIREMENTS.md`
- `DESIGN.md`
- `SPEC.md`
- `ARCHITECTURE.md`, when applicable
- `DOCUMENT-REVIEW.md`
- Design source
- Current repository
- Other relevant technical sources:

## 3. Review Method

### Pass 1 — Feasibility and completeness

Challenge repository assumptions, technical approach, scope, ordering, dependencies, task size, integration work, migration work, and validation.

### Pass 2 — Consistency, traceability, risks, and uncertainty

Review the corrected plan against upstream documents and verify complete requirement coverage without unsupported work.

## 4. Executive Summary

Summarize:

- overall feasibility;
- major corrections;
- blocking technical decisions;
- residual risks;
- readiness for task decomposition.

## 5. Plan Coverage

| Requirement or specification | Plan section or item | Coverage | Validation defined | Notes |
|---|---|---|---|---|
| ... | ... | Complete / Partial / Missing / N/A | Yes / No | ... |

## 6. Repository Assumption Check

| Plan claim | Repository evidence | Accurate | Required correction |
|---|---|---|---|
| Existing path, script, dependency, pattern, or capability | ... | Yes / No / Unconfirmed | ... |

Do not allow proposed files or conventions to be described as existing.

## 7. Findings

Use stable finding IDs.

### PLANREV-001 — Finding title

**Impact:** Critical / High / Medium / Low  
**Category:** Scope / Repository assumption / Dependency / Ordering / Task size / Integration / Migration / State / Responsive / Accessibility / Validation / Regression / Abstraction / Security / Privacy / Deployment / Rollback / Traceability / Other

**Finding**

Describe the weakness or failure mode.

**Evidence**

- Requirement or specification IDs:
- Architecture reference:
- Repository evidence:
- Plan section:

**Resolution**

Describe the correction selected.

**Change made to `PLAN.md`**

Identify the exact section, phase, task, dependency, or validation change.

**Remaining risk**

- ...

**Status:** Open / Corrected / Accepted risk / Blocked

Repeat for each finding.

## 8. Ordering and Dependency Review

| Plan item | Depends on | Dependency supported | Ordering issue | Resolution |
|---|---|---|---|---|
| ... | ... | Yes / No / Unclear | ... | ... |

## 9. Integration and Cross-Cutting Coverage

| Concern | Covered in plan | Location | Gap or correction |
|---|---|---|---|
| Accessibility | Yes / No / N/A | ... | ... |
| Responsive behavior | Yes / No / N/A | ... | ... |
| Loading, empty, error, and success states | Yes / No / N/A | ... | ... |
| Data and API integration | Yes / No / N/A | ... | ... |
| Migration and compatibility | Yes / No / N/A | ... | ... |
| Security and privacy | Yes / No / N/A | ... | ... |
| Testing and validation | Yes / No / N/A | ... | ... |
| Deployment and rollback | Yes / No / N/A | ... | ... |
| Regression protection | Yes / No / N/A | ... | ... |

## 10. Changes Applied to the Plan

| `PLAN.md` section | Change | Finding IDs | Result |
|---|---|---|---|
| ... | ... | ... | ... |

## 11. Residual Risks

| Risk | Impact | Likelihood | Mitigation or contingency | Owner | Status |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## 12. Blocking Decisions

| Decision | Why it blocks | Decision owner | Evidence needed | Next action |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 13. Final Review Checklist

### Feasibility and completeness

- [ ] The plan reflects the actual repository.
- [ ] Included and excluded scope are explicit.
- [ ] Phases produce meaningful, verifiable outcomes.
- [ ] Dependencies and ordering are valid.
- [ ] Integration, migration, and compatibility work are included.
- [ ] Accessibility, responsiveness, states, errors, and tests are integrated into relevant work.
- [ ] Validation is defined for every material plan item.
- [ ] Rollback or recovery is addressed where relevant.

### Consistency, traceability, risks, and uncertainty

- [ ] Every must-have requirement and material specification is covered.
- [ ] No plan item introduces unsupported product scope.
- [ ] Proposed and existing files are distinguished.
- [ ] Architecture decisions are respected when applicable.
- [ ] Residual risks and accepted tradeoffs are explicit.
- [ ] Blocking decisions remain visible.
- [ ] The updated `PLAN.md` received a second end-to-end review.

## 14. Final Readiness Status

Select exactly one:

- `Ready for task decomposition`
- `Ready with documented risks`
- `Blocked by unresolved technical decisions`

## 15. Completion Summary

- Files created or modified:
- Important findings:
- Plan corrections:
- Remaining risks:
- Open questions or blockers:
- Recommended next stage:
