# Design-to-Implementation Workflow

This workflow converts a design source into a documented, planned, implemented, and validated web project.

A **design source** may be a Figma file, screenshots, images, a PDF, an existing website, or another structured design artifact. Apply source-specific inspection only when the source supports it. For Figma sources, inspect pages, frames, nodes, components, variants, variables, styles, and prototypes.

## Shared execution rules

Apply these rules to every stage:

1. Read all listed sources before creating or modifying the target document.
2. Inspect the actual design source, repository files, and project documents; do not rely on filenames or summaries alone.
3. Use the relevant `Document-Guidelines-*.md` file as the structural and quality guideline for its corresponding document.
4. When a matching file exists in `templates/`, use it as the starting structure. Remove non-applicable sections and add project-specific sections when needed. Templates do not override guideline files or project evidence.
5. Apply guidelines and templates to the project; do not copy generic explanatory content into project documents.
6. Classify important information as:
   - **Confirmed:** explicitly supported by documentation or a user decision.
   - **Observed:** directly visible in the design source or repository.
   - **Inferred:** strongly suggested but not confirmed.
   - **Recommended:** a proposed resolution.
   - **Open question:** cannot be determined safely.
7. Never present an inference or recommendation as confirmed.
8. Document source conflicts instead of silently selecting an interpretation.
9. Preserve stable requirement and specification IDs.
10. Update documents in place; avoid duplicate “new,” “final,” or versioned alternatives.
11. Keep document responsibilities separate:
    - Product expectations → `REQUIREMENTS.md`
    - Visual and interaction intent → `DESIGN.md`
    - Precise testable behavior → `SPEC.md`
    - Structural technical decisions → `ARCHITECTURE.md`
    - Implementation ordering → `PLAN.md`
    - Executable implementation units → task files
12. Maintain traceability from design-source evidence through requirements, design, specification, architecture, plan, tasks, implementation, and validation.
13. Perform two review passes:
    - Completeness and correctness
    - Consistency, traceability, risks, and uncertainty
14. End each stage with files changed, findings, assumptions, blockers, and readiness for the next stage.

---

# Stage 1 — Audit the design source

Create or update `DESIGN-AUDIT.md` using `templates/DESIGN-AUDIT.template.md` as the starting structure.

## Inspect

- Source format, scope, identifiers, and references
- Screens, pages, sections, flows, frames, or equivalent source regions
- Desktop, tablet, mobile, and alternative layouts
- Components, variants, reusable patterns, styles, variables, and tokens when available
- Typography, color, spacing, grids, imagery, icons, and assets
- Content hierarchy and repeated data structures
- Interactions, transitions, and responsive transformations
- Default, hover, focus, active, selected, disabled, loading, empty, error, and success states
- Long-content, missing-content, and narrow-viewport behavior
- Accessibility implications and implementation risks

For Figma sources, include relevant page, frame, component, and node references. For other sources, use the most precise available location or evidence reference.

Identify missing states, inconsistent patterns, conflicting values, unclear responsive behavior, incomplete flows, and decisions that cannot be determined safely.

Organize unresolved findings into product, design, content, and technical questions.

`DESIGN-AUDIT.md` must become the factual evidence baseline for later stages.

---

# Stage 2 — Create project requirements

Analyze:

- The design source
- `DESIGN-AUDIT.md`
- Existing stakeholder or project documentation
- `Document-Guidelines-REQUIREMENTS.md`

Create or update `REQUIREMENTS.md`.

Define the problem, goals, non-goals, users, user needs, functional requirements, business rules, data requirements, non-functional requirements, accessibility, responsive behavior, content, constraints, dependencies, risks, assumptions, open questions, and Definition of Done.

Use stable identifiers such as `FR-*`, `BR-*`, `DR-*`, `NFR-*`, `AR-*`, `SEC-*`, and `CON-*`.

Each material requirement must include description, priority, rationale, acceptance criteria, and evidence. Separate confirmed, inferred, and recommended requirements. Do not invent business rules, permissions, backend behavior, thresholds, browser targets, security policies, or retention rules.

Add traceability from each requirement to design-source evidence or another authoritative source.

---

# Stage 3 — Document design intent

Analyze:

- The design source
- `DESIGN-AUDIT.md`
- `REQUIREMENTS.md`
- Existing stakeholder or project documentation
- `Document-Guidelines-DESIGN.md`

Create or update `DESIGN.md`.

Document design purpose, information architecture, reading order, screen structure, layout, hierarchy, typography, colors, tokens, spacing, components, variants, interactions, responsive behavior, states, edge cases, accessibility intent, assets, and design-system mapping.

Reference the most precise available design-source evidence. Map important design decisions to requirement IDs. Describe relationships and intent rather than producing a property or CSS dump.

Keep observed, inferred, recommended, and unresolved information clearly separated.

---

# Stage 4 — Create the technical specification

Analyze:

- The design source
- `DESIGN-AUDIT.md`
- `REQUIREMENTS.md`
- `DESIGN.md`
- Existing stakeholder or project documentation
- `Document-Guidelines-SPEC.md`

Create or update `SPEC.md`.

Translate requirements and design intent into precise, observable, testable behavior. Define scope, terminology, functionality, content, conceptual component structure, states, interactions, keyboard behavior, focus behavior, responsive behavior, accessibility, data, validation, error handling, edge cases, non-functional requirements, and acceptance criteria.

Every material specification must reference its requirement and relevant design evidence. Cover applicable interaction states and edge cases. Do not prescribe repository structure or implementation order unless they are genuine constraints.

---

# Stage 5 — Run the documentation consistency gate

Review:

- The design source
- `DESIGN-AUDIT.md`
- `REQUIREMENTS.md`
- `DESIGN.md`
- `SPEC.md`

Correct issues in the document that owns each decision and create or update `DOCUMENT-REVIEW.md` using `templates/DOCUMENT-REVIEW.template.md`.

Check for contradictions, missing coverage, unsupported behavior, untestable requirements, missing responsive or accessibility behavior, missing states, unclear data ownership, unsupported thresholds, assumptions presented as facts, and blocking open questions.

Record each finding, severity, affected documents, resolution, remaining uncertainty, and blocking status.

End with one status:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

---

# Stage 6 — Define architecture when applicable

Use this stage for projects with meaningful routing, state, data flow, integrations, authentication, persistence, build infrastructure, or deployment concerns.

For a genuinely simple static site or component, record why a separate architecture document is unnecessary and place the relevant structural decisions in `PLAN.md`.

Analyze the repository and all upstream documents. Follow `Document-Guidelines-ARCHITECTURE.md` and use `templates/ARCHITECTURE.template.md` when creating or updating `ARCHITECTURE.md`.

Document system boundaries, frontend and backend structure, routes, component boundaries, data flow, state ownership, API and integration boundaries, persistence, authentication, styling and design-system integration, assets, error handling, accessibility architecture, testing layers, build and deployment, security, observability, constraints, alternatives, tradeoffs, risks, and open technical decisions.

Map significant architectural decisions to requirement and specification IDs.

---

# Stage 7 — Create the implementation plan

Analyze the repository, design source, all upstream documents, and `Document-Guidelines-PLAN.md`.

Create or update `PLAN.md`.

Document current state, included and excluded scope, technical approach, files and modules, implementation phases, dependencies, validation strategy, migration or compatibility work, risks, mitigations, open questions, and Definition of Done.

Inspect the repository before naming paths, modules, commands, dependencies, or conventions. Distinguish confirmed existing files from proposed files and unresolved locations.

Every material plan item must reference its requirement or specification, file impact, dependencies, and validation method.

---

# Stage 8 — Challenge and refine the plan

Perform an adversarial review of `PLAN.md` against all upstream documents and the repository.

Update `PLAN.md` where needed and create or update `PLAN-REVIEW.md` using `templates/PLAN-REVIEW.template.md`.

Check repository assumptions, dependencies, ordering, task size, integration work, migrations, states, responsiveness, accessibility, validation, regressions, abstractions, dependencies, security, privacy, deployment, rollback, and traceability.

Record each finding, impact, resolution, plan change, and remaining risk.

End with:

- `Ready for task decomposition`
- `Ready with documented risks`
- `Blocked by unresolved technical decisions`

---

# Stage 9 — Decompose the plan into tasks

Create `TASKS-INDEX.md` using `templates/TASKS-INDEX.template.md` and create one file per implementation task using `templates/TASK.template.md`.

Use zero-padded filenames:

```text
Phase-01--Task-01.md
Phase-01--Task-02.md
Phase-02--Task-01.md
```

`TASKS-INDEX.md` must contain phases, task order, titles, statuses, dependencies, parallelization, requirement and specification coverage, and completion criteria.

Each task file must include:

- Status
- Objective
- Source references
- Prerequisites
- Included and excluded scope
- Repository context
- Files and modules
- Ordered implementation steps
- Validation
- Acceptance criteria
- Risks and considerations
- Definition of Done

Each task must produce one coherent, independently verifiable result. Do not defer all accessibility, responsiveness, error handling, or tests to a final cleanup task. Do not write implementation code during decomposition.

Verify that every plan item and every must-have requirement is covered.

---

# Stage 10 — Implement one task at a time

Select the first incomplete task whose prerequisites are satisfied.

Implement only its scope. Inspect affected files first, follow established project conventions, and do not silently expand scope.

When implementation reveals a documentation problem, update the document that owns the decision and propagate affected references.

Run the task’s required validation. Do not mark it complete while required validation fails.

Update the task status, `TASKS-INDEX.md`, and relevant documentation. Report files changed, behavior implemented, validation results, deviations, remaining risks, and the next unblocked task.

---

# Stage 11 — Validate the completed implementation

Compare the implemented project against:

- The design source
- `REQUIREMENTS.md`
- `DESIGN.md`
- `SPEC.md`
- `ARCHITECTURE.md`, when applicable
- `PLAN.md`
- All task files

Create or update `IMPLEMENTATION-REVIEW.md` using `templates/IMPLEMENTATION-REVIEW.template.md`.

Validate requirement coverage, acceptance criteria, design fidelity, states, responsiveness, keyboard operation, focus, semantics, screen-reader relationships, contrast, reduced motion, content behavior, validation, errors, loading and empty states, data and API behavior, compatibility, performance, security, tests, build, lint, type checking, deployment readiness, and regressions.

For each finding, record source requirement or specification, expected behavior, actual behavior, severity, evidence, correction, and status.

End with:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`
