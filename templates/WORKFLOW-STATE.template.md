# Workflow State Template

Use this file as the operational control record for the current project. Update it whenever stage, readiness, profile, execution mode, blockers, active snapshots, or next permitted action changes.

# Workflow State

## 1. Current Control State

- Profile: Lite / Standard / Full
- Execution mode: Gated / Continuous documentation / Task-by-task
- Current stage:
- Current status: Not started / In progress / Ready / Blocked / Complete
- Last updated:
- Last completed action:
- Next permitted action:

## 2. Active Source Baseline

- Source baseline: `SOURCE-BASELINE.md`
- Design snapshots: `SRC-DS-*` / None
- Repository snapshots: `SRC-REPO-*` / None
- Runtime snapshots: `SRC-RUN-*` / None
- Documentation snapshots: `SRC-DOC-*` / None
- Asset snapshots: `SRC-ASSET-*` / None
- Last verification date and method:
- Baseline status: Verified / Changed / Partially verified / Unverified

The active IDs must match `PROJECT-CONTEXT.md` and `SOURCE-BASELINE.md`.

## 3. Stage Registry

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
| 10 | Implement tasks | Code and updated task records | ... | ... |
| 11 | Validate implementation against pinned sources | `IMPLEMENTATION-REVIEW.md` | ... | ... |

Use `N/A — profile` only when the selected profile explicitly consolidates or omits the artifact.

## 4. Approved Artifacts

| Artifact | Status | Version, commit, or date | Baseline snapshot IDs | Approved by or evidence |
|---|---|---|---|---|
| ... | Draft / Reviewed / Approved / Superseded | ... | ... | ... |

## 5. Blocking Questions

| ID | Question | Decision owner | Impact | Required before |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 6. Non-blocking Assumptions

| Assumption | Classification | Impact | Validation or correction point |
|---|---|---|---|
| ... | Inferred / Recommended | ... | ... |

## 7. Architecture Decision

- Separate `ARCHITECTURE.md`: Required / Not required / Undecided
- Reason:
- Recorded by:

When architecture is skipped, place behavioral structural constraints in `SPEC.md` and repository or implementation structure in `PLAN.md`, or in their clearly separated Lite brief sections.

## 8. Source Verification and Rebaseline History

| Date | Previous active snapshots | New active snapshots | Change or verification result | Earliest affected stage | Action | Status |
|---|---|---|---|---:|---|---|
| ... | ... | ... | ... | ... | ... | Open / In progress / Complete |

When a material source changes, create new snapshot IDs, perform the impact assessment in `SOURCE-BASELINE.md`, and move the current stage backward when required.

## 9. Profile or Mode Changes

| Date | Previous | New | Reason | Effective stage |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 10. Stage Advancement Rules

- Verify relevant active snapshots before starting a stage, resuming after a meaningful pause, or declaring final acceptance.
- Do not silently inspect or implement against newer source content under an older snapshot ID.
- Do not advance while the current stage has a blocking exit status.
- In Gated mode, advance only after an explicit user request or approval.
- In Continuous documentation mode, stop before implementation.
- In Task-by-task mode, select only an incomplete task whose prerequisites are satisfied.
- Do not treat silence as approval for unresolved product, design, or architecture decisions.
- Do not bypass a blocked stage by converting uncertainty into an unsupported assumption.

## 11. Latest Completion Summary

- Files created or modified:
- Snapshot IDs used:
- Source verification performed:
- Important findings:
- Decisions:
- Validation performed:
- Deviations:
- Remaining risks:
- Next permitted action:
