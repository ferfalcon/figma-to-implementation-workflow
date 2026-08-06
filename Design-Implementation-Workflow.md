# Design-to-Implementation Workflow

This workflow converts a design source into a documented, planned, implemented, and validated web project. Use `Workflow-Profiles.md` to keep artifact depth proportional and `Identifier-Conventions.md` to keep traceability unambiguous.

## Shared execution rules

1. Respect `PROJECT-CONTEXT.md`, `WORKFLOW-STATE.md`, the selected profile, and execution mode.
2. Inspect actual sources rather than relying on filenames or summaries.
3. Use matching guidelines and templates; do not copy generic teaching content into project artifacts.
4. Classify important information as Confirmed, Observed, Inferred, Recommended, or Open question.
5. Document source conflicts instead of silently choosing an interpretation.
6. Use stable, globally distinct IDs from `Identifier-Conventions.md`.
7. Keep document responsibilities separate, even when the Lite profile consolidates them into sections.
8. Perform two review passes: completeness and correctness; then consistency, traceability, risks, and uncertainty after corrections.
9. End each stage by updating `WORKFLOW-STATE.md` with findings, blockers, readiness, and the next permitted action.
10. Never report validation as passed unless it was executed successfully.

---

# Stage 0 — Establish project context and workflow control

Create or update:

- `PROJECT-CONTEXT.md` from `templates/PROJECT-CONTEXT.template.md`;
- `WORKFLOW-STATE.md` from `templates/WORKFLOW-STATE.template.md`.

Record:

- project goal and type;
- exact design-source scope and snapshot or inspection reference;
- repository, target branch, baseline commit, and relevant package or application;
- production or preview references when available;
- included, excluded, and deferred scope;
- authoritative sources and known conflicts;
- quality expectations supported by evidence;
- constraints, dependencies, risks, and blocking questions;
- selected Lite, Standard, or Full profile and rationale;
- Gated, Continuous documentation, or Task-by-task execution mode.

Do not advance when the baseline is materially ambiguous. Stage 0 is complete when scope, source references, repository baseline, profile, mode, blockers, and next permitted action are explicit.

---

# Stage 1 — Audit the design source

Create or update `DESIGN-AUDIT.md` using its template.

Inspect source scope, screens and flows, viewports, components and variants, styles and variables, visual system, content hierarchy, interactions, states, responsive transformations, edge cases, assets, accessibility implications, inconsistencies, and missing evidence.

Use `EVD-*` for evidence and `AUD-*` for findings. The audit owns observed evidence, not product or implementation decisions.

---

# Stages 2–4 — Requirements, design intent, and specification

## Standard and Full

Create:

- `REQUIREMENTS.md` from `templates/REQUIREMENTS.template.md`;
- `DESIGN.md` from `templates/DESIGN.template.md`;
- `SPEC.md` from `templates/SPEC.template.md`.

`REQUIREMENTS.md` owns outcomes, rules, constraints, and quality expectations using `REQ-*` IDs.

`DESIGN.md` owns visual, responsive, content, and interaction intent using `DES-*`, `DES-RWD-*`, and `DES-INT-*` IDs.

`SPEC.md` owns precise, observable, testable behavior using `SPEC-*` and `AC-*` IDs.

Do not reuse a requirement ID as a specification ID. Do not invent business rules, thresholds, breakpoints, focus behavior, security policies, or backend behavior.

## Lite

Create `IMPLEMENTATION-BRIEF.md` from its template. Keep requirements, design intent, specification, and planning in separate ownership sections using the same global namespaces.

---

# Stage 5 — Documentation consistency gate

For Standard and Full, correct issues in the owning document and create or update `DOCUMENT-REVIEW.md`.

Check contradictions, missing coverage, unsupported behavior, untestable language, responsive gaps, accessibility gaps, missing states, unclear data ownership, unsupported thresholds, and assumptions presented as facts.

For Lite, perform the two review passes inside `IMPLEMENTATION-BRIEF.md` after completing its requirements, design, and specification sections.

End with exactly one readiness status:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

---

# Stage 6 — Define architecture when applicable

Create `ARCHITECTURE.md` for meaningful routing, shared state, data flow, APIs, integrations, persistence, authentication, build, deployment, security, reliability, observability, or migration decisions.

## When architecture is skipped

1. Record the decision and reason in `WORKFLOW-STATE.md`.
2. Place behavioral structural constraints in `SPEC.md`, or the Lite specification section.
3. Place repository and implementation structure in `PLAN.md`, or the Lite plan section.
4. Treat later architecture references as optional.

Skipping the artifact never means skipping technical reasoning.

---

# Stage 7 — Create the implementation plan

For Standard and Full, create or update `PLAN.md` from `templates/PLAN.template.md`. For Lite, complete the plan section of `IMPLEMENTATION-BRIEF.md`.

Inspect the repository before naming paths, commands, dependencies, or conventions. Distinguish existing from proposed files.

Each `PLAN-*` item must include objective, requirement or specification references, file impact, dependencies, implementation approach, integrated accessibility and responsive work, state and error handling, validation, and risks.

Accessibility, responsive behavior, errors, states, and tests belong in the work that creates or changes the relevant behavior. A final phase may verify them, but must not be where they are first implemented.

Select breakpoints from design evidence, content or layout failure, and existing project conventions rather than default device numbers.

---

# Stage 8 — Challenge and refine the plan

For Standard and Full, perform an adversarial review, correct `PLAN.md`, and create or update `PLAN-REVIEW.md`.

For Lite, complete the second review pass in `IMPLEMENTATION-BRIEF.md` after first-pass corrections.

Check repository assumptions, scope, ordering, dependencies, integration, migrations, task size, accessibility, responsiveness, states, validation, regressions, abstraction, security, privacy, deployment, rollback, and traceability.

End with:

- `Ready for task decomposition`
- `Ready with documented risks`
- `Blocked by unresolved technical decisions`

---

# Stage 9 — Decompose into tasks

Standard and Full require `TASKS-INDEX.md` and task files. Lite may use one task file when the work is a single coherent result; use an index when multiple tasks or dependencies exist.

Each task must have one independently verifiable objective, source references, prerequisites, scope, repository context, files, ordered steps, integrated responsive and accessibility requirements, validation, acceptance criteria, risks, and Definition of Done.

Use zero-padded task IDs such as `P01-T01` and filenames such as `Phase-01--Task-01.md`.

Do not defer all accessibility, responsiveness, errors, or tests to final cleanup.

---

# Stage 10 — Implement one task at a time

Select only an incomplete task whose prerequisites are satisfied. Inspect affected files first and implement only the task scope.

When implementation exposes a documentation error, update the owning artifact and propagate references. Run required validation and do not mark the task complete while required checks fail or remain unverified.

Update the task, optional index, and `WORKFLOW-STATE.md` with files changed, behavior, validation evidence, discoveries, deviations, risks, and next permitted action.

---

# Stage 11 — Validate the completed implementation

Create or update `IMPLEMENTATION-REVIEW.md` and compare the result against the design source, approved requirements, design intent, specification, architecture when applicable, plan or brief, tasks, and repository baseline.

Validate requirement and acceptance-criterion coverage, fidelity, states, responsiveness, content edge cases, keyboard operation, focus, semantics, accessible names and relationships, announcements, contrast, reflow, reduced motion, data and APIs, validation, errors, compatibility, performance, security, tests, build, lint, type checking, deployment readiness, and regressions as applicable.

Record `IMPL-*` findings with expected behavior, actual behavior, severity, evidence, correction, status, and retest evidence.

End with exactly one result:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`
