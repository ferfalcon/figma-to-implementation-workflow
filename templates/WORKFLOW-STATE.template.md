# Workflow State Template

Use this file as the operational control record for the current project. Update it whenever stage, readiness, profile, execution mode, blockers, active inputs, implementation outputs, or next permitted action changes.

# Workflow State

## 1. Current Control State

- Profile: Lite / Standard / Full
- Execution mode: Gated / Continuous documentation / Task-by-task
- Current stage:
- Current status: Not started / In progress / Ready / Blocked / Complete
- Last updated:
- Last completed action:
- Next permitted action:

## 2. Active Input Baseline

- Source baseline: `SOURCE-BASELINE.md`
- Design inputs: `SRC-DS-*` / None
- Repository input baseline: `SRC-REPO-*` / None
- Documentation inputs: `SRC-DOC-*` / None
- Asset inputs: `SRC-ASSET-*` / None
- Supporting runtime inputs: `SRC-RUN-*` / None
- Last input verification date and method:
- Input baseline status: Verified / Changed / Partially verified / Unverified

## 3. Implementation and Validation Lineage

- Current task-start repository snapshot: `SRC-REPO-*` / None
- Latest approved implementation-output snapshot: `SRC-REPO-*` / None
- Current validation-runtime snapshot: `SRC-RUN-*` / None
- Last completed task: task ID / None
- Lineage status: Complete / In progress / Broken / Unverified

Approved task outputs advance implementation lineage. They do not replace or supersede the original repository input baseline.

## 4. Stage Registry

| Stage | Purpose | Artifact or result | Status | Exit result |
|---:|---|---|---|---|
| 0 | Establish context, snapshots, and control | `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, `WORKFLOW-STATE.md` | ... | ... |
| 1 | Audit pinned design evidence | `DESIGN-AUDIT.md` | ... | ... |
| 2 | Define requirements | `REQUIREMENTS.md` or Lite brief section | ... | ... |
| 3 | Document design intent | `DESIGN.md` or Lite brief section | ... | ... |
| 4 | Define testable behavior | `SPEC.md` or Lite brief section | ... | ... |
| 5 | Review documentation | `DOCUMENT-REVIEW.md` or Lite brief review | ... | ... |
| 6 | Define architecture when applicable | `ARCHITECTURE.md` or recorded skip | ... | ... |
| 7 | Plan implementation | `PLAN.md` or Lite brief section | ... | ... |
| 8 | Review the plan | `PLAN-REVIEW.md` or Lite brief review | ... | ... |
| 9 | Decompose tasks | Task file(s) and optional `TASKS-INDEX.md` | ... | ... |
| 10 | Implement tasks and record output lineage | Code and updated task records | ... | ... |
| 11 | Validate implementation against pinned inputs and outputs | `IMPLEMENTATION-REVIEW.md` | ... | ... |

Use `N/A — profile` only when the selected profile explicitly consolidates or omits the artifact.

## 5. Approved Artifacts

| Artifact | Status | Version, commit, or date | Baseline snapshot IDs | Approved by or evidence |
|---|---|---|---|---|
| ... | Draft / Reviewed / Approved / Superseded | ... | ... | ... |

## 6. Blocking Questions

| ID | Question | Decision owner | Impact | Required before |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 7. Non-blocking Assumptions

| Assumption | Classification | Impact | Validation or correction point |
|---|---|---|---|
| ... | Inferred / Recommended | ... | ... |

## 8. Architecture Decision

- Separate `ARCHITECTURE.md`: Required / Not required / Undecided
- Reason:
- Recorded by:

When architecture is skipped, place behavioral structural constraints in `SPEC.md` and repository or implementation structure in `PLAN.md`, or in their clearly separated Lite brief sections.

## 9. Source Verification, Outputs, and Rebaseline History

| Date | Classification | Previous snapshot | New snapshot | Change or result | Affected stage or task | Action | Status |
|---|---|---|---|---|---|---|---|
| ... | Unchanged / Expected output / Unexpected upstream change / Unavailable | ... | ... | ... | ... | ... | Open / In progress / Complete |

Expected task outputs update lineage without rolling back upstream stages. Unexpected material input or concurrent changes require impact assessment in `SOURCE-BASELINE.md` and may move the workflow backward.

## 10. Profile or Mode Changes

| Date | Previous | New | Reason | Effective stage |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 11. Stage Advancement Rules

- Verify relevant input and task-start snapshots before a stage, after a meaningful pause, before a task, and before final acceptance.
- Classify differences as Unchanged, Expected output, Unexpected upstream change, or Unavailable.
- Do not silently use newer source content under an older snapshot ID.
- Approved implementation outputs advance task lineage and do not automatically invalidate upstream artifacts.
- Unexpected upstream or concurrent changes must follow rebaseline impact assessment.
- Do not advance while the current stage has a blocking exit status.
- In Gated mode, advance only after an explicit user request or approval.
- In Continuous documentation mode, stop before implementation.
- In Task-by-task mode, select only an incomplete task whose prerequisites are satisfied.
- Do not treat silence as approval for unresolved product, design, source, or architecture decisions.
- Do not bypass a blocked stage through unsupported assumptions.

## 12. Latest Completion Summary

- Files created or modified:
- Input snapshot IDs used:
- Task-start snapshot:
- Implementation-output snapshot:
- Validation-runtime snapshot:
- Source verification performed:
- Important findings:
- Decisions:
- Validation performed:
- Deviations:
- Remaining risks:
- Next permitted action:
