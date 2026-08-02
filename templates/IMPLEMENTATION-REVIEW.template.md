# Implementation Review Template

Use this template to create a project-specific `IMPLEMENTATION-REVIEW.md`.

This document records final validation of the completed implementation against the design source, requirements, design intent, specification, architecture when applicable, plan, and task files.

Do not report a test, build, lint, type check, accessibility check, or manual review as passed unless it was actually executed successfully.

# Implementation Review

## 1. Document Information

- Status: In progress
- Review date: YYYY-MM-DD
- Reviewer:
- Project:
- Implementation commit or version:
- Environment:
- Live or preview URL, when available:

## 2. Review Scope

### Included

- Implemented features, pages, components, services, or flows
- Supported viewports, browsers, and environments
- Automated and manual validation defined by project documents

### Excluded

- Deferred or future work
- Areas not changed by the implementation
- Checks that could not be executed, with reasons

## 3. Source Baseline

- Design source:
- `DESIGN-AUDIT.md`:
- `REQUIREMENTS.md`:
- `DESIGN.md`:
- `SPEC.md`:
- `ARCHITECTURE.md`, when applicable:
- `PLAN.md`:
- `PLAN-REVIEW.md`:
- `TASKS-INDEX.md`:
- Task files:
- Other authoritative sources:

Record versions, commits, dates, or references needed to reproduce the review.

## 4. Validation Environment

Document:

- operating system and runtime;
- browser and device coverage;
- viewport sizes;
- test data or accounts;
- environment variables or service dependencies;
- accessibility tools;
- network or performance conditions;
- known environment limitations.

## 5. Validation Execution Summary

| Check | Command, tool, or method | Executed | Result | Evidence |
|---|---|---|---|---|
| Build | ... | Yes / No | Passed / Failed / Blocked / Not applicable | ... |
| Type checking | ... | ... | ... | ... |
| Linting | ... | ... | ... | ... |
| Automated tests | ... | ... | ... | ... |
| Accessibility checks | ... | ... | ... | ... |
| Responsive review | ... | ... | ... | ... |
| Visual comparison | ... | ... | ... | ... |

Explain every failed, blocked, skipped, or unavailable check.

## 6. Requirement and Specification Coverage

| Source ID | Expected result | Implementation evidence | Validation | Status |
|---|---|---|---|---|
| ... | ... | ... | ... | Pass / Fail / Partial / Blocked / N/A |

Every must-have requirement and material specification must appear.

## 7. Findings

Use stable finding IDs.

### IMPL-001 — Finding title

**Severity:** Critical / High / Medium / Low  
**Category:** Requirement / Design fidelity / State / Responsive / Accessibility / Content / Validation / Error handling / Data / API / Compatibility / Performance / Security / Test coverage / Build / Deployment / Regression / Other

**Source requirement or specification**

- ...

**Expected behavior**

Describe the required result.

**Actual behavior**

Describe what the implementation does.

**Evidence**

- Repository path or commit:
- Test or command output:
- Screenshot, recording, or design reference:
- Browser, viewport, or environment:

**Required correction**

Describe the change needed for compliance.

**Status:** Open / Corrected / Accepted deviation / Blocked

**Retest evidence**

Complete after correction.

Repeat for each finding.

## 8. Design Fidelity

Review:

- information architecture and hierarchy;
- layout and spacing relationships;
- typography and color roles;
- components and variants;
- assets and iconography;
- interactions and motion;
- content behavior;
- approved deviations.

| Area | Design reference | Implementation evidence | Result | Notes |
|---|---|---|---|---|
| ... | ... | ... | Pass / Fail / Partial | ... |

## 9. State and Edge-Case Validation

| Element or flow | Default | Hover | Focus | Active | Selected | Disabled | Loading | Empty | Error | Success | Edge cases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

Use `N/A` only when the state is genuinely irrelevant.

## 10. Responsive and Content Validation

| Viewport or condition | Expected behavior | Actual behavior | Result | Evidence |
|---|---|---|---|---|
| Narrow mobile | ... | ... | Pass / Fail / Partial | ... |
| Intermediate width | ... | ... | ... | ... |
| Desktop | ... | ... | ... | ... |
| Unusually wide viewport | ... | ... | ... | ... |
| Long content | ... | ... | ... | ... |
| Missing content or asset | ... | ... | ... | ... |

## 11. Accessibility Validation

Review applicable:

- semantic structure and heading hierarchy;
- keyboard operation;
- focus order and visible focus;
- accessible names and relationships;
- announcements and error communication;
- color contrast;
- touch targets;
- zoom, text resizing, and reflow;
- reduced motion;
- screen-reader behavior.

| Check | Method | Result | Evidence | Finding |
|---|---|---|---|---|
| ... | ... | Pass / Fail / Blocked / N/A | ... | ... |

Automated checks do not replace keyboard, focus, and screen-reader review when those checks are required.

## 12. Data, API, and Error Validation

When applicable, validate:

- data shape and ownership;
- validation boundaries;
- loading and retry behavior;
- empty and partial data;
- client and server errors;
- authorization and authentication;
- duplicate actions and idempotency;
- failed integrations;
- persistence and migration behavior.

| Scenario | Expected | Actual | Result | Evidence |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 13. Non-Functional Validation

| Concern | Requirement | Method | Result | Evidence |
|---|---|---|---|---|
| Compatibility | ... | ... | ... | ... |
| Performance | ... | ... | ... | ... |
| Security and privacy | ... | ... | ... | ... |
| Reliability | ... | ... | ... | ... |
| SEO or metadata | ... | ... | ... | ... |
| Deployment readiness | ... | ... | ... | ... |

Do not invent thresholds or policies not present in project requirements.

## 14. Regression Review

| Existing behavior | Regression risk | Validation performed | Result | Finding |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 15. Approved Deviations

| Deviation | Source expectation | Reason | Approval or evidence | Impact |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

Do not label an unapproved defect as a deviation.

## 16. Corrections and Retesting

| Finding | Correction | Files changed | Retest method | Retest result |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 17. Remaining Risks and Limitations

| Risk or limitation | Impact | Mitigation | Blocking |
|---|---|---|---|
| ... | ... | ... | Yes / No |

## 18. Final Review Checklist

### Completeness and correctness

- [ ] Every must-have requirement and material specification was reviewed.
- [ ] Design fidelity, states, responsive behavior, and content edge cases were checked.
- [ ] Accessibility checks required by the project were executed.
- [ ] Data, API, error, compatibility, performance, security, and deployment checks were addressed when applicable.
- [ ] Existing functionality was checked for regressions.
- [ ] Findings include reproducible evidence and objective corrections.

### Consistency, traceability, risks, and uncertainty

- [ ] Every finding traces to a source expectation.
- [ ] Executed, failed, blocked, skipped, and unavailable checks are distinguished honestly.
- [ ] Corrected findings were retested.
- [ ] Approved deviations include evidence or approval.
- [ ] Remaining risks and limitations are explicit.
- [ ] The final result matches the unresolved finding severity.

## 19. Final Result

Select exactly one:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`

## 20. Completion Summary

- Files reviewed:
- Validation executed:
- Findings by severity:
- Corrections completed:
- Approved deviations:
- Remaining risks:
- Recommended next action:
