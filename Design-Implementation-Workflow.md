# Design-to-Implementation Workflow

This workflow converts a design source into a documented, planned, implemented, and validated web project. Use `Workflow-Profiles.md` for proportional artifact depth, `Identifier-Conventions.md` for traceability, and `Source-Snapshots.md` for reproducible source baselines.

## Shared execution rules

1. Respect `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, `WORKFLOW-STATE.md`, the selected profile, and execution mode.
2. Inspect actual sources rather than relying on filenames or summaries.
3. Pin material sources using `SRC-*` records. A mutable URL or branch name alone is not a sufficient snapshot.
4. Every artifact must reference the snapshot IDs it actually used.
5. Never silently use newer source content under an older snapshot ID.
6. Use matching guidelines and templates; do not copy generic teaching content into project artifacts.
7. Classify important information as Confirmed, Observed, Inferred, Recommended, or Open question.
8. Document source conflicts instead of silently choosing an interpretation.
9. Use stable, globally distinct IDs from `Identifier-Conventions.md`.
10. Keep document responsibilities separate, even when the Lite profile consolidates them into sections.
11. Perform two review passes: completeness and correctness; then consistency, traceability, risks, and uncertainty after corrections.
12. End each stage by updating `WORKFLOW-STATE.md` with snapshot verification, findings, blockers, readiness, and the next permitted action.
13. Never report validation as passed unless it was executed successfully.

---

# Stage 0 — Establish source baseline, project context, and workflow control

Create or update:

- `SOURCE-BASELINE.md` from `templates/SOURCE-BASELINE.template.md`;
- `PROJECT-CONTEXT.md` from `templates/PROJECT-CONTEXT.template.md`;
- `WORKFLOW-STATE.md` from `templates/WORKFLOW-STATE.template.md`.

Record:

- project goal and type;
- exact design-source scope;
- design snapshot IDs with named version, checksum-backed export, or honest Time-bound classification;
- repository snapshot IDs pinned to commit SHAs;
- runtime, documentation, and asset snapshots when relevant;
- production or preview references when available;
- included, excluded, and deferred scope;
- authoritative sources and known conflicts;
- quality expectations supported by evidence;
- constraints, dependencies, risks, and blocking questions;
- selected Lite, Standard, or Full profile and rationale;
- Gated, Continuous documentation, or Task-by-task execution mode.

Do not claim immutable reproducibility for a mutable Figma URL, website, branch, or shared document. State pin strength and limitations.

Do not advance when the material baseline is ambiguous or Unverified without an explicit documented exception. Stage 0 is complete when source records, active snapshot IDs, scope, profile, mode, blockers, and next permitted action are explicit and consistent across all three Stage 0 artifacts.

---

# Stage 1 — Audit the pinned design source

Verify the active design snapshots, then create or update `DESIGN-AUDIT.md` using its template.

Inspect source scope, screens and flows, viewports, components and variants, styles and variables, visual system, content hierarchy, interactions, states, responsive transformations, edge cases, assets, accessibility implications, inconsistencies, and missing evidence.

Use `EVD-*` for evidence and `AUD-*` for findings. Every evidence item must identify the `SRC-DS-*` snapshot where it was observed. The audit owns observed evidence, not product or implementation decisions.

---

# Stages 2–4 — Requirements, design intent, and specification

Before each stage, confirm that the relevant source snapshots remain valid or record the verification limitation.

## Standard and Full

Create:

- `REQUIREMENTS.md` from `templates/REQUIREMENTS.template.md`;
- `DESIGN.md` from `templates/DESIGN.template.md`;
- `SPEC.md` from `templates/SPEC.template.md`.

Each artifact must include baseline metadata referencing its design, repository, runtime, documentation, and asset snapshots as applicable.

`REQUIREMENTS.md` owns outcomes, rules, constraints, and quality expectations using `REQ-*` IDs.

`DESIGN.md` owns visual, responsive, content, and interaction intent using `DES-*`, `DES-RWD-*`, and `DES-INT-*` IDs.

`SPEC.md` owns precise, observable, testable behavior using `SPEC-*` and `AC-*` IDs.

Do not reuse a requirement ID as a specification ID. Do not invent business rules, thresholds, breakpoints, focus behavior, security policies, or backend behavior.

## Lite

Create `IMPLEMENTATION-BRIEF.md` from its template. Keep requirements, design intent, specification, and planning in separate ownership sections using the same global namespaces and pinned snapshot metadata.

---

# Stage 5 — Documentation consistency gate

For Standard and Full, correct issues in the owning document and create or update `DOCUMENT-REVIEW.md`.

Check snapshot references, contradictions, missing coverage, unsupported behavior, untestable language, responsive gaps, accessibility gaps, missing states, unclear data ownership, unsupported thresholds, and assumptions presented as facts.

Confirm that no reviewed artifact silently depends on a newer design, repository, runtime, or document source than the IDs in its metadata.

For Lite, perform the two review passes inside `IMPLEMENTATION-BRIEF.md` after completing its requirements, design, and specification sections.

End with exactly one readiness status:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

---

# Stage 6 — Define architecture when applicable

Create `ARCHITECTURE.md` for meaningful routing, shared state, data flow, APIs, integrations, persistence, authentication, build, deployment, security, reliability, observability, or migration decisions.

Architecture claims about the current repository must reference `SRC-REPO-*`. Runtime-boundary claims should reference `SRC-RUN-*` when based on observed deployments.

## When architecture is skipped

1. Record the decision and reason in `WORKFLOW-STATE.md`.
2. Place behavioral structural constraints in `SPEC.md`, or the Lite specification section.
3. Place repository and implementation structure in `PLAN.md`, or the Lite plan section.
4. Treat later architecture references as optional.

Skipping the artifact never means skipping technical reasoning.

---

# Stage 7 — Create the implementation plan

Verify the repository snapshot before planning. For Standard and Full, create or update `PLAN.md` from `templates/PLAN.template.md`. For Lite, complete the plan section of `IMPLEMENTATION-BRIEF.md`.

Inspect the repository before naming paths, commands, dependencies, or conventions. Distinguish existing from proposed files. Current-state claims must be supported by a pinned repository snapshot.

Each `PLAN-*` item must include objective, requirement or specification references, file impact, dependencies, implementation approach, integrated accessibility and responsive work, state and error handling, validation, and risks.

Accessibility, responsive behavior, errors, states, and tests belong in the work that creates or changes the relevant behavior. A final phase may verify them, but must not be where they are first implemented.

Select breakpoints from design evidence, content or layout failure, and existing project conventions rather than default device numbers.

---

# Stage 8 — Challenge and refine the plan

For Standard and Full, perform an adversarial review, correct `PLAN.md`, and create or update `PLAN-REVIEW.md`.

For Lite, complete the second review pass in `IMPLEMENTATION-BRIEF.md` after first-pass corrections.

Check snapshot integrity, repository assumptions, scope, ordering, dependencies, integration, migrations, task size, accessibility, responsiveness, states, validation, regressions, abstraction, security, privacy, deployment, rollback, and traceability.

End with:

- `Ready for task decomposition`
- `Ready with documented risks`
- `Blocked by unresolved technical decisions`

---

# Stage 9 — Decompose into tasks

Standard and Full require `TASKS-INDEX.md` and task files. Lite may use one task file when the work is a single coherent result; use an index when multiple tasks or dependencies exist.

Tasks and the index must retain the approved snapshot IDs from the plan. Each task must have one independently verifiable objective, source references, prerequisites, scope, repository context, files, ordered steps, integrated responsive and accessibility requirements, validation, acceptance criteria, risks, and Definition of Done.

Use zero-padded task IDs such as `P01-T01` and filenames such as `Phase-01--Task-01.md`.

Do not defer all accessibility, responsiveness, errors, or tests to final cleanup.

---

# Stage 10 — Implement one task at a time

Before implementing a task, verify that its repository and design snapshots remain applicable. Select only an incomplete task whose prerequisites are satisfied. Inspect affected files first and implement only the task scope.

When a material source changes:

1. stop affected work;
2. create a new snapshot ID in `SOURCE-BASELINE.md`;
3. perform the rebaseline impact assessment;
4. move `WORKFLOW-STATE.md` to the earliest affected stage;
5. update and review affected artifacts before continuing.

When implementation exposes a documentation error, update the owning artifact and propagate references. Run required validation and do not mark the task complete while required checks fail or remain unverified.

Update the task, optional index, and `WORKFLOW-STATE.md` with snapshots used, files changed, behavior, validation evidence, discoveries, deviations, risks, and next permitted action.

---

# Stage 11 — Validate the completed implementation

Create or update `IMPLEMENTATION-REVIEW.md` and compare the result against the exact source snapshots referenced by approved artifacts, the implementation commit, and the runtime snapshot used for validation.

Validate requirement and acceptance-criterion coverage, fidelity, states, responsiveness, content edge cases, keyboard operation, focus, semantics, accessible names and relationships, announcements, contrast, reflow, reduced motion, data and APIs, validation, errors, compatibility, performance, security, tests, build, lint, type checking, deployment readiness, and regressions as applicable.

Perform the final baseline integrity check from `Source-Snapshots.md`. An implementation must not be accepted as matching “the design” without identifying the design snapshot.

Record `IMPL-*` findings with expected behavior, actual behavior, severity, evidence, correction, status, and retest evidence.

End with exactly one result:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`
