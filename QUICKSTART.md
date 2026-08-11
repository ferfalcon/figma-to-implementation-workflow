# Quickstart: Complete an Express Workflow

This tutorial walks one narrow design-to-implementation change from intake to final review. It uses the Express profile because Express demonstrates the complete workflow with one `WORKPACK.md` and exactly one implementation task.

Use Lite, Standard, or Full when the work exceeds the Express eligibility rules in [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md).

## Prerequisites

- Node.js 22 or newer;
- a Git repository for the implementation project with at least one commit;
- a design source or another reference that can be recorded precisely;
- the toolkit installed as `@ferfalcon/design-workflow`, or the repository available for direct CLI execution.

The examples use the installed `design-workflow` command. During toolkit development, replace it with:

```bash
node /path/to/figma-to-implementation-workflow/cli/design-workflow.mjs
```

Run the commands from the implementation project's root directory, not from this toolkit repository.

## 1. Initialize the workflow

```bash
design-workflow init \
  --name "Article preview card" \
  --profile Express \
  --mode Gated \
  --design "https://www.figma.com/design/...?..." \
  --repository .
```

Initialization creates:

```text
WORKPACK.md
.workflow/workflow-record.json
.workflow/generated/WORKFLOW-STATUS.md
.workflow/generated/SOURCE-INDEX.md
.workflow/generated/ARTIFACT-INDEX.md
.workflow/generated/TASK-INDEX.md
```

The workflow record owns mutable control state. `WORKPACK.md` owns the evidence, decisions, requirements, design intent, specification, plan, task detail, validation narrative, and final review. Files under `.workflow/generated/` are derived views and must not be edited manually.

Confirm the initial state:

```bash
design-workflow status
design-workflow sync --check
```

## 2. Establish and inspect the baseline

Complete the source-baseline and scope sections of `WORKPACK.md`. Record what was inspected, which design frame or node is in scope, when mutable sources were observed, repository state, source limitations, and any authority conflicts.

Add supporting sources when needed:

```bash
design-workflow snapshot add \
  --kind doc \
  --role "Supporting source" \
  --reference "Approved content brief revision 3"
```

Do not mark a mutable URL as immutable. If the design, repository, documentation, assets, or runtime changes materially, create a new snapshot and assess the impact before continuing.

## 3. Complete the documentation stages

Work through the corresponding `WORKPACK.md` sections before each stage change. Stage changes are explicit; the CLI records them but does not decide whether the prose or design reasoning is good enough.

```bash
design-workflow stage set 1 --status "In progress"
# Audit the pinned design evidence.

design-workflow stage set 2 --status "In progress"
# Define requirements and constraints.

design-workflow stage set 3 --status "In progress"
# Document visual, responsive, content, and interaction intent.

design-workflow stage set 4 --status "In progress"
# Define observable behavior, states, accessibility, and acceptance criteria.

design-workflow stage set 5 --status "In progress"
# Perform the two required documentation-review passes.

design-workflow stage set 6 --status "In progress"
# Confirm that Express still has no architecture concern; upgrade if it does.

design-workflow stage set 7 --status "In progress"
# Write the repository-aware implementation approach.

design-workflow stage set 8 --status "In progress"
# Challenge the plan and correct it before task creation.
```

At any point, inspect the recorded next action:

```bash
design-workflow next
```

If the work now needs a second independent task, architecture, integration, migration, persistence, authentication, deployment planning, or a material unresolved product decision, stop and upgrade the profile.

## 4. Create and implement the task

Create the single Express task after the plan review is complete. Task creation advances the record to Stage 9.

```bash
design-workflow task create \
  --title "Implement the article preview card" \
  --references REQ-FR-001,SPEC-BEH-001,AC-001

design-workflow task start P01-T01
```

Before editing code, verify that the task baseline still describes the repository state you are about to change. Record discoveries and approved deviations in `WORKPACK.md` while implementing.

Commit the completed implementation, then record the full output commit and executed validation:

```bash
design-workflow task complete P01-T01 \
  --commit 2222222222222222222222222222222222222222 \
  --check "Tests=npm test completed successfully" \
  --check "Keyboard=manual keyboard review passed"
```

Replace the example SHA and evidence with actual results. Use `--na "Check name=reason"` only when a check genuinely does not apply. Task completion creates an immutable Implementation output snapshot linked to the task and its repository baseline.

## 5. Perform final review and close the workflow

Complete the final-review section of `WORKPACK.md` against the exact input snapshots and implementation-output commit. Review responsive behavior, accessibility, required states, visual fidelity, content, executed automated checks, applicable manual checks, deviations, and remaining risk.

After the final review supports acceptance:

```bash
design-workflow stage set 11 --status Complete
design-workflow validate
design-workflow sync --check
design-workflow status
```

Commit the canonical record, generated views, `WORKPACK.md`, implementation, and relevant evidence together. Never claim a check passed merely because its name appears in the record.

## What Is Automatically Enforced?

Automation protects record structure and traceability. Human review establishes whether the design interpretation, product decisions, implementation, and evidence are actually correct.

| Concern | Automatically enforced by the CLI, schema, or validator | Requires human review or external tooling |
|---|---|---|
| Profile structure | Required artifact types; Express workpack consolidation, one-task limit, and no task prerequisites; Lite consolidation rules | Profile eligibility, risk assessment, and the decision to upgrade when complexity grows |
| Workflow control | Stage range, allowed status values, and Task-by-task mode not beginning before task decomposition | Whether a stage's substantive exit criteria are truly satisfied before advancing |
| Source registry | Snapshot ID syntax, roles, statuses, pin-strength values, references, and internal snapshot relationships | Source identity, freshness, authority, completeness, limitations, and whether a mutable source changed |
| Repository lineage | Full commit-SHA shape for implementation outputs; output-to-task and output-to-baseline relationships | Commit existence, repository cleanliness, ancestry, concurrent changes, and whether the commit contains the reviewed work |
| Artifact inventory | Artifact IDs, types, statuses, required profile inventory, baselines, and reference syntax | Content quality, approval authority, internal consistency, and whether Markdown accurately reflects its sources |
| Requirements, design, and specification | Identifier syntax when IDs are recorded in the workflow record | Correctness, completeness, accessibility intent, responsive behavior, product rules, and resolution of source conflicts |
| Task dependencies | Referenced tasks, self-dependencies, dependency cycles, prerequisite completion at task start, and one current task through CLI commands | Task scope, implementation quality, repository impact, and whether the selected checks cover likely regressions |
| Validation state | Allowed result states; evidence text for Passed results; reasons for blocked, failed, unexecuted, or not-applicable results; no unresolved required checks on a completed task | Whether evidence is truthful and reproducible, expected results were correct, manual checks were competent, and coverage is sufficient |
| Generated views | Deterministic rendering, record digest, missing-file detection, and manual-edit or record-drift detection | Decisions, rationale, and narrative history, which must remain in their owning Markdown artifacts |
| Final acceptance | Completion-state consistency, Stage 11 requirement, completed recorded tasks, and generated-view freshness | Acceptance judgment against exact inputs and outputs, severity decisions, approved deviations, and remaining-risk ownership |

The practical rule is: a passing validator means the recorded workflow is structurally and semantically consistent. It does not prove that the design was interpreted correctly, the implementation works, accessibility is complete, or the recorded evidence is true.

## Useful recovery commands

After an intentional direct edit to `.workflow/workflow-record.json`:

```bash
design-workflow sync
design-workflow validate
```

When `next` refuses to advance, resolve the reported record or generated-state findings rather than bypassing them. When a substantive product, design, architecture, or source question is unresolved, record it in `WORKPACK.md` and treat it as blocking when its answer could change the implementation.
