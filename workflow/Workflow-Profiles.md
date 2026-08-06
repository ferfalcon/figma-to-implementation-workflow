# Workflow Profiles

Workflow profiles keep the process proportional to project risk and complexity without removing essential design, accessibility, source integrity, implementation, or validation concerns.

Select a profile during Stage 0 and record it in `PROJECT-CONTEXT.md` and `WORKFLOW-STATE.md`. Create `SOURCE-BASELINE.md` for every profile.

A profile controls artifact granularity. It does not permit unsupported assumptions, unpinned material sources, skipped validation, or implementation without evidence.

## Selection principles

Choose a profile from actual complexity, not only file count or visual size.

Consider:

- number and complexity of user flows;
- routes, screens, and reusable patterns;
- persistence, APIs, and third-party integrations;
- authentication or authorization;
- shared state and data-flow complexity;
- architectural migration or compatibility work;
- deployment, security, privacy, or operational risk;
- number of contributors or implementation agents;
- cost of incorrect assumptions.

When uncertain, select the lower profile only when its consolidation rules can preserve every material concern. Upgrade as soon as the work exceeds those limits.

## Shared required controls

Every profile requires:

- `SOURCE-BASELINE.md` — pinned or honestly time-bound source records;
- `PROJECT-CONTEXT.md` — stable project and scope baseline;
- `WORKFLOW-STATE.md` — active stage, snapshot IDs, blockers, and next action.

Every downstream artifact must reference the snapshot IDs it actually used.

## Lite profile

Use for an isolated component, a small static page, or a narrowly scoped change with no meaningful architecture, persistence, authentication, or complex integration decisions.

### Required artifacts

- `SOURCE-BASELINE.md`
- `PROJECT-CONTEXT.md`
- `WORKFLOW-STATE.md`
- `DESIGN-AUDIT.md`
- `IMPLEMENTATION-BRIEF.md`
- one task file, or `TASKS-INDEX.md` plus task files when more than one task is needed
- `IMPLEMENTATION-REVIEW.md`

### Consolidation rules

`IMPLEMENTATION-BRIEF.md` may consolidate the responsibilities of `REQUIREMENTS.md`, `DESIGN.md`, `SPEC.md`, and `PLAN.md`, but it must keep those concerns in clearly separated sections and use their normal identifier namespaces.

The brief must include:

- baseline snapshot references;
- product outcomes and constraints;
- visual, responsive, content, and interaction intent;
- precise, testable behavior and acceptance criteria;
- repository-aware implementation approach;
- integrated accessibility, responsive, state, error, and validation work;
- two distinct review passes.

A separate `DOCUMENT-REVIEW.md`, `ARCHITECTURE.md`, or `PLAN-REVIEW.md` is not required unless findings justify upgrading the profile.

### Upgrade triggers

Upgrade to Standard or Full when the work introduces:

- multiple connected flows or routes;
- significant shared state;
- persistence, authentication, authorization, or external APIs;
- architectural migration;
- non-trivial deployment, security, privacy, or rollback concerns;
- enough uncertainty that consolidated ownership becomes unclear.

## Standard profile

Use for multi-page sites, substantial UI features, existing application features, or work with meaningful repository integration but limited system-wide architectural risk.

### Required artifacts

- `SOURCE-BASELINE.md`
- `PROJECT-CONTEXT.md`
- `WORKFLOW-STATE.md`
- `DESIGN-AUDIT.md`
- `REQUIREMENTS.md`
- `DESIGN.md`
- `SPEC.md`
- `DOCUMENT-REVIEW.md`
- `PLAN.md`
- `PLAN-REVIEW.md`
- `TASKS-INDEX.md` and task files
- `IMPLEMENTATION-REVIEW.md`

`ARCHITECTURE.md` remains conditional. When skipped, follow the architecture-skip rules in [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md).

## Full profile

Use for full-stack applications, authentication, persistence, multiple services or packages, complex integrations, significant migrations, or high deployment, security, privacy, or reliability risk.

Use the complete Standard artifact set plus `ARCHITECTURE.md` and any architecture decision records required for independently reviewable structural decisions.

Full-profile work should explicitly cover, when applicable:

- runtime and trust boundaries;
- state and data ownership;
- APIs, persistence, and migrations;
- authentication and authorization;
- security and privacy controls;
- build, deployment, rollback, and recovery;
- reliability, observability, and testing architecture.

## Profile comparison

| Concern | Lite | Standard | Full |
|---|---|---|---|
| Stage 0 snapshots, context, and state | Required | Required | Required |
| Design audit | Required | Required | Required |
| Separate requirements, design, and specification files | Consolidated | Required | Required |
| Documentation consistency gate | In brief | Separate artifact | Separate artifact |
| Separate architecture | No, unless upgraded | Conditional | Normally required |
| Separate plan and adversarial plan review | Consolidated | Required | Required |
| Task decomposition | Proportional | Required | Required |
| Final implementation review | Required | Required | Required |

## Execution modes

Record one execution mode in `WORKFLOW-STATE.md`.

### Gated

- Stop after every stage or consolidated Lite artifact.
- Advance only after an explicit user request or approval.
- Use when decisions require close review or the scope is still changing.

### Continuous documentation

- Continue through permitted documentation, review, planning, and task-decomposition stages while no blocker exists.
- Stop before implementation.
- Do not treat silence as approval for unresolved product, design, architectural, or source-baseline decisions.

### Task-by-task

- Use only after documentation and planning gates pass.
- Implement one unblocked task at a time.
- Verify relevant snapshots before implementation when a source may have changed.
- Run validation and update workflow state before selecting the next task.
- Do not silently combine unrelated tasks.

## Changing profiles, modes, or baselines

A profile or execution mode may change when new evidence changes project complexity or risk. A source baseline changes through the rebaseline protocol in [`Source-Snapshots.md`](Source-Snapshots.md).

When a profile or mode changes:

1. update `PROJECT-CONTEXT.md` when the profile decision changes materially;
2. update `WORKFLOW-STATE.md` immediately;
3. record the reason and effective stage;
4. create any newly required artifacts before advancing;
5. do not discard stable IDs or approved decisions.

When a source changes, create new `SRC-*` IDs and assess affected artifacts rather than silently replacing the existing baseline.
