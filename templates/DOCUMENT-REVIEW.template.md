# Documentation Review Template

Use this template to create a project-specific `DOCUMENT-REVIEW.md`.

This document is an audit trail for the documentation consistency gate. Correct problems in the document that owns each decision, then record the finding and resolution here.

# Documentation Review

## 1. Document Information

- Status: In progress
- Review date: YYYY-MM-DD
- Reviewer:
- Project:
- Reviewed versions or commits:

## 2. Review Scope

Reviewed sources:

- Design source
- `DESIGN-AUDIT.md`
- `REQUIREMENTS.md`
- `DESIGN.md`
- `SPEC.md`
- Other authoritative project documentation:

Excluded sources or areas:

- ...

## 3. Review Method

### Pass 1 — Completeness and correctness

Check each document against its own responsibility and source evidence.

### Pass 2 — Consistency, traceability, risks, and uncertainty

Check relationships across documents after corrections from the first pass have been applied.

## 4. Executive Summary

Summarize:

- overall documentation quality;
- number and severity of findings;
- blocking decisions;
- corrections applied;
- remaining non-blocking uncertainty.

## 5. Source-of-Truth Rules

| Decision type | Owning document |
|---|---|
| Product outcome, rule, constraint, or quality expectation | `REQUIREMENTS.md` |
| Visual, responsive, or interaction intent | `DESIGN.md` |
| Precise and testable behavior | `SPEC.md` |
| Structural technical decision | `ARCHITECTURE.md`, when applicable |
| Implementation order and file impact | `PLAN.md` |

Do not resolve stakeholder decisions through guesswork.

## 6. Coverage Overview

| Requirement ID | Design support | Specification support | Evidence reference | Coverage status | Notes |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Complete / Partial / Missing / N/A | ... |

## 7. Findings

Use a stable finding ID. Do not reuse IDs after a finding has been removed or superseded.

### DOC-001 — Finding title

**Severity:** Critical / High / Medium / Low  
**Category:** Contradiction / Missing coverage / Unsupported behavior / Untestable language / Responsive / Accessibility / State / Content / Data / Traceability / Assumption / Other  
**Blocking:** Yes / No

**Finding**

Describe the problem precisely.

**Evidence**

- Design-source reference:
- Requirement or specification IDs:
- Document sections:
- Repository evidence, when relevant:

**Affected documents**

- ...

**Decision owner**

- `REQUIREMENTS.md` / `DESIGN.md` / `SPEC.md` / Other

**Resolution**

Describe the accepted correction or explain why it remains unresolved.

**Changes applied**

| Document | Section or ID | Change |
|---|---|---|
| ... | ... | ... |

**Remaining uncertainty**

- ...

**Status:** Open / Corrected / Accepted deviation / Blocked

Repeat for each finding.

## 8. Traceability Problems

| Finding ID | Source item | Missing or incorrect link | Required correction | Status |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 9. Open Questions and Decisions

| Question ID | Question | Decision owner | Impact | Blocking | Needed by |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Yes / No | ... |

## 10. Corrections Applied

| Document | Change summary | Findings resolved | Validation performed |
|---|---|---|---|
| ... | ... | ... | ... |

## 11. Remaining Risks

| Risk | Impact | Likelihood | Mitigation | Blocking |
|---|---|---|---|---|
| ... | ... | ... | ... | Yes / No |

## 12. Final Cross-Document Review

### Completeness and correctness

- [ ] Every must-have requirement has specification coverage.
- [ ] Design decisions support relevant requirements.
- [ ] Applicable states and edge cases are documented.
- [ ] Responsive and accessibility expectations are represented.
- [ ] Validation, error, and content behavior are defined where needed.
- [ ] Requirements and specifications are objectively testable.

### Consistency, traceability, risks, and uncertainty

- [ ] IDs and cross-references are valid.
- [ ] No specification behavior lacks requirement or design support.
- [ ] No inference or recommendation is presented as confirmed.
- [ ] Corrections were made in the document that owns the decision.
- [ ] Remaining uncertainty and blockers are visible.
- [ ] A second review was performed after corrections.

## 13. Completion Status

Select exactly one:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

## 14. Completion Summary

- Files created or modified:
- Important findings:
- Assumptions introduced:
- Open questions or blockers:
- Recommended next stage:
