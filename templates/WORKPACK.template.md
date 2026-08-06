# Express Workpack Template

Use this template only for the Express profile. `WORKPACK.md` is the single normative Markdown artifact for one narrow, coherent implementation result.

Do not create separate source-baseline, context, audit, requirements, design, specification, plan, task, or implementation-review files while the work remains eligible for Express. Preserve the normal identifier namespaces inside the sections below.

```yaml
---
artifact: WORKPACK
profile: Express
status: Draft
execution_mode: Gated | Continuous documentation | Task-by-task
current_stage: 0
current_status: Not started | In progress | Ready | Blocked | Complete
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

# Workpack: Result title

## 1. Control state

- Objective:
- Included design scope:
- Included repository scope:
- Execution mode:
- Current stage:
- Current status:
- Last completed action:
- Next permitted action:
- Blocking questions: None / ...

## 2. Express eligibility

Confirm every condition before proceeding.

- [ ] One design-source scope or one clearly bounded source bundle
- [ ] One coherent implementation result
- [ ] At most one implementation task
- [ ] No persistence, authentication, authorization, or external API work
- [ ] No meaningful routing, shared-state, migration, deployment, security, privacy, or rollback decision
- [ ] No unresolved product decision that materially changes expected behavior
- [ ] No multi-contributor coordination requiring separate task ownership
- [ ] The result can be independently validated without broader feature reconstruction

### Upgrade triggers

Record `None` or identify the trigger and upgrade target.

- Multiple independent results or tasks:
- Connected routes or flows:
- Shared state or cross-feature integration:
- Persistence, authentication, authorization, or APIs:
- Architectural migration or operational risk:
- Material source conflict or unresolved product decision:
- Other:

If any trigger is material, stop affected work and upgrade to Lite, Standard, or Full. Preserve stable IDs and source records when splitting this workpack into separate artifacts.

## 3. Source baseline

Define every source ID once. A mutable URL alone is not an immutable snapshot.

| Snapshot ID | Role | Category and type | Canonical reference | Included scope | Revision, version, checksum, or commit | Captured or inspected | Pin strength | Status | Limitations |
|---|---|---|---|---|---|---|---|---|---|
| `SRC-DS-001` | Input baseline | Design source | ... | ... | ... | ... | Immutable / Versioned / Time-bound / Unverified | Active | ... |
| `SRC-REPO-001` | Task start | Repository | ... | ... | Commit SHA | ... | Immutable | Active | ... |

### Source authority and conflicts

- Authority order:
- Conflicts:
- Resolution or open question:

### Snapshot verification

- Verification date and method:
- Difference classification: Unchanged / Expected workflow output / Unexpected upstream or concurrent change / Unavailable
- Rebaseline required: Yes / No
- Action or limitation:

## 4. Scope and constraints

### Included

- ...

### Excluded

- ...

### Constraints

- Technology and repository constraints:
- Content and asset constraints:
- Accessibility baseline:
- Browser or device constraints:
- Time or delivery constraints:

## 5. Observed design evidence

Use `EVD-*` for evidence and `AUD-*` for findings. Reference the exact source snapshot and region.

| Evidence ID | Source and precise region | Observation | Classification | Impact |
|---|---|---|---|---|
| `EVD-001` | `SRC-DS-001` → ... | ... | Observed | ... |

| Finding ID | Finding | Severity | Required action or question | Status |
|---|---|---|---|---|
| `AUD-001` | ... | High / Medium / Low | ... | Open / Resolved |

Inspect applicable component structure, responsive behavior, states, interactions, content edges, assets, and accessibility implications. Do not invent behavior absent from the evidence.

## 6. Expected result

Keep ownership distinct even though it is consolidated.

### Requirements

| Requirement ID | Outcome, rule, or constraint | Priority | Evidence or authority |
|---|---|---|---|
| `REQ-FUNC-001` | ... | Must / Should / Could | ... |

### Design intent

| Design ID | Visual, responsive, content, or interaction intent | Evidence | Confidence |
|---|---|---|---|
| `DES-001` | ... | `EVD-001` | Confirmed / Observed / Inferred / Recommended |

Use `DES-RWD-*` for responsive intent and `DES-INT-*` for interaction intent.

### Specification and acceptance criteria

| Specification ID | Observable behavior | Related requirement |
|---|---|---|
| `SPEC-001` | ... | `REQ-FUNC-001` |

- [ ] `AC-001` ...
- [ ] `AC-002` ...

Cover applicable default, hover, focus, active, disabled, loading, empty, error, success, long-content, missing-asset, and reduced-motion behavior.

## 7. Repository-aware implementation approach

- Task-start snapshot: `SRC-REPO-001`
- Existing files and patterns:
- Reusable components, utilities, tokens, and tests:
- Files to create, modify, or delete:
- Proposed approach:
- Responsive implementation:
- Semantic HTML and accessibility behavior:
- State and error handling:
- Tests and manual checks:
- Risks and likely regressions:

Do not invent paths, commands, dependencies, or conventions without repository evidence.

## 8. Single implementation unit

- Task ID: `P01-T01`
- Status: Not started / Ready / In progress / Blocked / Complete
- Objective:
- Baseline repository snapshot: `SRC-REPO-001`
- Upstream references:
- Prerequisites: None
- Included files and behavior:
- Excluded work:
- Ordered implementation steps:
- Required validation:
- Definition of Done:

Express permits at most one implementation task. A second independent task is an upgrade trigger.

## 9. Review pass 1 — Completeness and correctness

Review and correct:

- source identity and scope;
- Express eligibility;
- evidence coverage;
- requirements, design intent, specification, and acceptance criteria;
- repository assumptions;
- accessibility, responsive behavior, states, errors, and validation;
- unsupported claims or missing decisions.

### Corrections

- ...

### Pass result

Ready for pass 2 / Blocked

## 10. Review pass 2 — Consistency, traceability, and risk

After pass-1 corrections, review:

- snapshot and ID integrity;
- requirement → design → specification → acceptance → task traceability;
- contradictions and hidden assumptions;
- scope containment and upgrade triggers;
- repository compatibility and regression risk;
- whether every required check is executable and evidence-producing.

### Corrections

- ...

### Readiness result

- Ready for implementation
- Ready with documented non-blocking risks
- Blocked or must upgrade profile

## 11. Implementation record and output lineage

Complete only after implementation.

- Files created, modified, or deleted:
- Behavior implemented:
- Implementation discoveries:
- Deviations:
- Parent task-start snapshot: `SRC-REPO-001`
- Implementation output snapshot: `SRC-REPO-002`
- Output commit SHA:
- Produced by task: `P01-T01`

Add the implementation output snapshot to the source-baseline table. Do not replace the original input baseline.

## 12. Validation evidence

Use Passed, Failed, Blocked, Not executed, or Not applicable. A passed check requires evidence; every other status requires a reason.

| Check | Expected result | Status | Evidence or reason |
|---|---|---|---|
| Build, lint, or type check | ... | ... | ... |
| Automated behavior | ... | ... | ... |
| Keyboard and focus | ... | ... | ... |
| Semantics and accessible names | ... | ... | ... |
| Responsive and content edges | ... | ... | ... |
| Visual comparison against `SRC-DS-*` | ... | ... | ... |
| Regression checks | ... | ... | ... |

Corrected findings require retesting.

## 13. Final implementation review

- Exact design inputs reviewed:
- Exact repository output reviewed:
- Validation runtime snapshot, when applicable:
- Requirements and acceptance criteria result:
- Remaining deviations:
- Remaining risks:
- Baseline and lineage integrity:

### Findings

| Finding ID | Expected | Actual | Severity | Correction | Status | Retest evidence |
|---|---|---|---|---|---|---|
| `IMPL-001` | ... | ... | Critical / High / Medium / Low | ... | Open / Corrected / Accepted deviation | ... |

### Final result

Use exactly one:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`

## 14. Change and upgrade history

| Date | Change, rebaseline, or profile decision | Reason | Affected IDs or sections | Result |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
