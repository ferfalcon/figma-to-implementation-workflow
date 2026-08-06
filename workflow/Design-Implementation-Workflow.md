# Design-to-Implementation Workflow

This workflow converts a design source into a documented, planned, implemented, and validated web project.

Use:

- [`Workflow-Profiles.md`](Workflow-Profiles.md) for proportional artifact depth;
- [`Identifier-Conventions.md`](Identifier-Conventions.md) for traceability;
- [`Source-Snapshots.md`](Source-Snapshots.md) for reproducible source baselines;
- [`Source-Authority.md`](Source-Authority.md) for source ownership and conflict resolution;
- [`Validation-Rules.md`](Validation-Rules.md) for evidence and completion rules.

## Shared execution rules

1. Respect `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, `WORKFLOW-STATE.md`, the selected profile, and execution mode.
2. Inspect actual sources rather than relying on filenames or summaries.
3. Pin material sources using `SRC-*` records. A mutable URL or branch name alone is not a sufficient snapshot.
4. Every artifact must reference the snapshot IDs it actually used.
5. Never silently use newer source content under an older snapshot ID.
6. Distinguish upstream input changes from expected implementation outputs.
7. Apply source authority from `Source-Authority.md`; do not resolve conflicts silently.
8. Use matching guidelines and templates; do not copy generic teaching content into project artifacts.
9. Classify important information as Confirmed, Observed, Inferred, Recommended, or Open question.
10. Use stable, globally distinct IDs from `Identifier-Conventions.md`.
11. Keep document responsibilities separate, even when the Lite profile consolidates them into sections.
12. Perform two review passes: completeness and correctness; then consistency, traceability, source integrity, risks, and uncertainty after corrections.
13. End each stage by updating `WORKFLOW-STATE.md` with snapshot verification, output lineage, findings, blockers, readiness, and next action.
14. Follow `Validation-Rules.md`; never report validation as passed unless it was executed successfully.

---

# Stage 0 — Establish source baseline, project context, and workflow control

Create or update:

- `SOURCE-BASELINE.md` from [`../templates/SOURCE-BASELINE.template.md`](../templates/SOURCE-BASELINE.template.md);
- `PROJECT-CONTEXT.md` from [`../templates/PROJECT-CONTEXT.template.md`](../templates/PROJECT-CONTEXT.template.md);
- `WORKFLOW-STATE.md` from [`../templates/WORKFLOW-STATE.template.md`](../templates/WORKFLOW-STATE.template.md).

Record project goal and type; exact design scope; design snapshot IDs; repository input snapshot pinned to a commit; runtime, documentation, and asset snapshots when relevant; scope; source authority and conflicts; quality expectations; constraints; risks; profile; and execution mode.

Do not claim immutable reproducibility for a mutable Figma URL, website, branch, or shared document. State pin strength and limitations.

Do not advance when a material input baseline is ambiguous or Unverified without an explicit documented exception. Stage 0 is complete when source records, active input snapshot IDs, scope, profile, mode, blockers, and next action are explicit and consistent.

---

# Stage 1 — Audit the pinned design source

Verify active design inputs, then create or update `DESIGN-AUDIT.md` from [`../templates/DESIGN-AUDIT.template.md`](../templates/DESIGN-AUDIT.template.md).

Apply the appropriate guide in [`../source-adapters/`](../source-adapters/).

Inspect source scope, screens and flows, viewports, components and variants, styles and variables, visual system, content hierarchy, interactions, states, responsive transformations, edge cases, assets, accessibility implications, inconsistencies, and missing evidence.

Use `EVD-*` for evidence and `AUD-*` for findings. Every evidence item must identify the `SRC-DS-*` snapshot where it was observed.

---

# Stages 2–4 — Requirements, design intent, and specification

Before each stage, confirm that relevant input snapshots remain valid or record the limitation.

## Standard and Full

Create:

- `REQUIREMENTS.md` from [`../templates/REQUIREMENTS.template.md`](../templates/REQUIREMENTS.template.md), following [`../guidelines/REQUIREMENTS.md`](../guidelines/REQUIREMENTS.md);
- `DESIGN.md` from [`../templates/DESIGN.template.md`](../templates/DESIGN.template.md), following [`../guidelines/DESIGN.md`](../guidelines/DESIGN.md);
- `SPEC.md` from [`../templates/SPEC.template.md`](../templates/SPEC.template.md), following [`../guidelines/SPEC.md`](../guidelines/SPEC.md).

Each artifact must reference its actual design, repository, runtime, documentation, and asset snapshots.

`REQUIREMENTS.md` owns outcomes, rules, constraints, and quality expectations using `REQ-*` IDs.

`DESIGN.md` owns visual, responsive, content, and interaction intent using `DES-*`, `DES-RWD-*`, and `DES-INT-*` IDs.

`SPEC.md` owns precise, observable, testable behavior using `SPEC-*` and `AC-*` IDs.

Do not reuse requirement IDs as specification IDs. Do not invent business rules, thresholds, breakpoints, focus behavior, security policies, or backend behavior.

## Lite

Create `IMPLEMENTATION-BRIEF.md` from [`../templates/IMPLEMENTATION-BRIEF.template.md`](../templates/IMPLEMENTATION-BRIEF.template.md). Keep requirements, design, specification, and planning in separate ownership sections using normal namespaces and pinned snapshot metadata.

---

# Stage 5 — Documentation consistency gate

For Standard and Full, correct issues in the owning document and create or update `DOCUMENT-REVIEW.md` from [`../templates/DOCUMENT-REVIEW.template.md`](../templates/DOCUMENT-REVIEW.template.md).

Check snapshot references, contradictions, missing coverage, unsupported behavior, untestable language, responsive and accessibility gaps, missing states, unclear data ownership, unsupported thresholds, and assumptions presented as facts.

Confirm that no reviewed artifact silently depends on a newer input source than its metadata.

For Lite, perform both review passes inside `IMPLEMENTATION-BRIEF.md`.

End with exactly one status:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

---

# Stage 6 — Define architecture when applicable

Create `ARCHITECTURE.md` from [`../templates/ARCHITECTURE.template.md`](../templates/ARCHITECTURE.template.md), following [`../guidelines/ARCHITECTURE.md`](../guidelines/ARCHITECTURE.md), for meaningful routing, shared state, data flow, APIs, integrations, persistence, authentication, build, deployment, security, reliability, observability, or migration decisions.

Current repository claims must reference `SRC-REPO-*`. Runtime claims should reference `SRC-RUN-*` when based on deployments.

## When architecture is skipped

1. Record the decision and reason in `WORKFLOW-STATE.md`.
2. Place behavioral structural constraints in `SPEC.md`, or the Lite specification section.
3. Place repository and implementation structure in `PLAN.md`, or the Lite plan section.
4. Treat later architecture references as optional.

Skipping the artifact never means skipping technical reasoning.

---

# Stage 7 — Create the implementation plan

Verify the repository input snapshot before planning. For Standard and Full, create or update `PLAN.md` from [`../templates/PLAN.template.md`](../templates/PLAN.template.md), following [`../guidelines/PLAN.md`](../guidelines/PLAN.md). For Lite, complete the plan section of `IMPLEMENTATION-BRIEF.md`.

Inspect the repository before naming paths, commands, dependencies, or conventions. Distinguish existing from proposed files. Current-state claims must be supported by a pinned commit.

Each `PLAN-*` item must include objective, upstream references, snapshots, file impact, dependencies, approach, integrated accessibility and responsive work, states, errors, validation, and risks.

Accessibility, responsive behavior, errors, states, and tests belong in the work that creates or changes the relevant behavior. A final phase may verify them but must not introduce them for the first time.

Select breakpoints from design evidence, content or layout failure, and repository conventions rather than default device numbers.

---

# Stage 8 — Challenge and refine the plan

For Standard and Full, perform an adversarial review, correct `PLAN.md`, and create or update `PLAN-REVIEW.md` from [`../templates/PLAN-REVIEW.template.md`](../templates/PLAN-REVIEW.template.md).

For Lite, complete the second review pass in `IMPLEMENTATION-BRIEF.md` after corrections.

Check input snapshot integrity, repository assumptions, scope, ordering, dependencies, integration, migrations, task size, accessibility, responsiveness, states, validation, regressions, abstraction, security, privacy, deployment, rollback, and traceability.

End with:

- `Ready for task decomposition`
- `Ready with documented risks`
- `Blocked by unresolved technical decisions`

---

# Stage 9 — Decompose into tasks

Standard and Full require `TASKS-INDEX.md` from [`../templates/TASKS-INDEX.template.md`](../templates/TASKS-INDEX.template.md) and task files from [`../templates/TASK.template.md`](../templates/TASK.template.md). Lite may use one task file for a single coherent result.

Tasks retain approved input snapshot IDs and identify a task-start repository snapshot. Each task has one independently verifiable objective, references, prerequisites, scope, repository context, files, ordered steps, integrated responsive and accessibility work, validation, acceptance criteria, risks, and Definition of Done.

Use zero-padded task IDs such as `P01-T01` and filenames such as `Phase-01--Task-01.md`.

Do not defer all accessibility, responsiveness, errors, or tests to cleanup.

---

# Stage 10 — Implement one task at a time

Before a task, verify design inputs and the task-start repository snapshot. Select only an incomplete task whose prerequisites are satisfied and implement only its scope.

Classify source differences:

- **Unchanged:** continue.
- **Expected previous-task output:** use the approved output snapshot as this task's start; do not reopen upstream stages.
- **Unexpected upstream or concurrent change:** stop affected work, create a new snapshot, perform impact assessment, and move to the earliest affected stage when required.
- **Unavailable:** record the limitation and block when material.

When a task completes successfully:

1. commit the approved result;
2. create a new `SRC-REPO-*` record with role Implementation output;
3. connect it to the task-start snapshot and task ID;
4. use it as the next task's Task start when applicable;
5. update the task, index, source baseline, and workflow state.

Expected implementation outputs advance repository lineage. They do not supersede the original repository input baseline and do not trigger upstream rebaseline rollback.

When implementation exposes a documentation error, update the owning artifact and propagate references. Do not mark the task complete while required checks fail or remain unverified.

---

# Stage 11 — Validate the completed implementation

Create or update `IMPLEMENTATION-REVIEW.md` from [`../templates/IMPLEMENTATION-REVIEW.template.md`](../templates/IMPLEMENTATION-REVIEW.template.md) and compare the result against exact input snapshots, approved artifacts, the pinned Implementation output repository snapshot, and the Validation runtime snapshot.

Validate requirements, acceptance criteria, fidelity, states, responsiveness, content edges, keyboard operation, focus, semantics, accessible names and relationships, announcements, contrast, reflow, reduced motion, data, APIs, validation, errors, compatibility, performance, security, tests, build, lint, type checking, deployment readiness, and regressions as applicable.

Perform the final baseline and lineage integrity check from `Source-Snapshots.md`. The reviewed commit must be represented by an Implementation output `SRC-REPO-*`; the validation runtime must identify that output when known.

Record `IMPL-*` findings with expected behavior, actual behavior, severity, evidence, correction, status, and retest evidence.

End with exactly one result:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`
