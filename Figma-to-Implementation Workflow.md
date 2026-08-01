# Figma-to-Implementation Workflow

## Shared execution rules

Apply the following rules to every stage in this workflow:

1. Read all listed source materials completely before creating or modifying the target document.
2. Inspect the actual Figma nodes, repository files, and existing project documents. Do not rely on filenames, summaries, or assumptions alone.
3. Treat the relevant `Document-Guidelines-*.md` file as the structural and quality guideline for its corresponding document.
4. Do not copy explanatory content from a guideline into the project document. Apply the guideline to the actual project.
5. Clearly classify information as:

   * **Confirmed:** explicitly supported by project documentation or a user decision.
   * **Observed:** directly visible or defined in Figma or the repository.
   * **Inferred:** strongly suggested but not explicitly confirmed.
   * **Recommended:** proposed to resolve a gap or implementation concern.
   * **Open question:** cannot be determined safely from the available evidence.
6. Never present an inference or recommendation as a confirmed requirement.
7. When sources conflict, document the conflict. Do not silently select one source as correct.
8. Preserve stable requirement and specification identifiers once they have been created.
9. Update existing documents in place. Do not create unnecessary alternative versions such as `SPEC-new.md` or `PLAN-final-v2.md`.
10. Keep document responsibilities separate:

    * Product expectations belong in `REQUIREMENTS.md`.
    * Visual and interaction intent belongs in `DESIGN.md`.
    * Precise testable behavior belongs in `SPEC.md`.
    * Structural technical decisions belong in `ARCHITECTURE.md`.
    * Implementation ordering belongs in `PLAN.md`.
    * Executable implementation units belong in task files.
11. Maintain traceability between Figma evidence, requirements, design decisions, specifications, implementation work, and validation.
12. Perform two explicit review passes before completing each stage:

    * **Review pass 1 — Completeness and correctness**
    * **Review pass 2 — Consistency, traceability, and uncertainty**
13. End every stage with:

    * Files created or modified
    * Important findings
    * Assumptions introduced
    * Open questions or blockers
    * Whether the project is ready for the next stage

---

# Stage 1 — Audit the Figma source

Carefully inspect and analyze the complete relevant scope of the Figma file.

Your goal is to create or update `FIGMA-AUDIT.md`.

## Sources

* The supplied Figma file or node
* Any linked Figma pages, sections, frames, components, variables, styles, and prototypes that are relevant to the project

## Instructions

1. Determine the exact Figma scope being analyzed.
2. Record:

   * File, page, section, frame, and node names
   * Relevant node identifiers
   * Screens and page flows
   * Components, component sets, variants, and instances
   * Variables, styles, tokens, and reusable patterns
   * Typography, colors, spacing, grids, and layout systems
   * Assets, icons, illustrations, and images
   * Interactive states and prototype connections
   * Responsive or alternative viewport frames
   * Visible loading, empty, error, success, disabled, hover, focus, and active states
   * Content patterns and repeated data structures
3. Identify:

   * Missing states
   * Detached or inconsistent component instances
   * Conflicting token values
   * Unclear responsive behavior
   * Incomplete prototype paths
   * Accessibility concerns visible in the design
   * Design decisions that cannot be determined from Figma
4. For every material observation, include the relevant Figma page, frame, or node reference.
5. Do not convert inferred product behavior into confirmed requirements.
6. Organize unresolved findings into:

   * Product questions
   * Design questions
   * Content questions
   * Technical questions

## Required result

`FIGMA-AUDIT.md` must provide a factual evidence baseline that later documents can reference without repeatedly rediscovering the Figma structure.

Perform both required review passes before completing the stage.

---

# Stage 2 — Create the project requirements

Deeply analyze:

* The Figma file
* `FIGMA-AUDIT.md`
* Existing project or stakeholder documentation
* `Document-Guidelines-REQUIREMENTS.md`

Your goal is to create or update `REQUIREMENTS.md`.

## Instructions

1. Follow `Document-Guidelines-REQUIREMENTS.md`.
2. Define:

   * Project overview
   * Problem statement
   * Goals and non-goals
   * Users and stakeholders
   * User needs
   * Functional requirements
   * Business rules
   * Data requirements
   * Non-functional requirements
   * Accessibility requirements
   * Responsive requirements
   * Content requirements
   * Constraints
   * Dependencies
   * Risks
   * Assumptions
   * Open questions
   * Definition of Done
3. Assign stable identifiers such as:

   * `FR-*`
   * `BR-*`
   * `DR-*`
   * `NFR-*`
   * `AR-*`
   * `SEC-*`
   * `CON-*`
4. Give each requirement:

   * A clear description
   * Priority
   * Rationale
   * Verifiable acceptance criteria
   * Evidence or source
5. Separate requirements into:

   * Confirmed requirements
   * Inferred requirements
   * Recommended requirements requiring approval
6. Do not invent:

   * Business rules
   * User permissions
   * Backend behavior
   * Performance thresholds
   * Browser-support targets
   * Security policies
   * Data-retention policies
     unless they are supported by a source or clearly labeled as recommendations.
7. Keep the document implementation-neutral except where a technology is an actual project constraint.
8. Add a traceability table connecting each requirement to its Figma evidence or other source.

## Review pass 1

Check that every requirement is specific, necessary, unambiguous, prioritized, and testable.

## Review pass 2

Check that no Figma inference has been presented as a confirmed product decision and that no requirement contradicts another requirement.

---

# Stage 3 — Document the design intent

Deeply analyze:

* The Figma file
* `FIGMA-AUDIT.md`
* `REQUIREMENTS.md`
* `Document-Guidelines-DESIGN.md`

Your goal is to create or update `DESIGN.md`.

## Instructions

1. Follow `Document-Guidelines-DESIGN.md`.
2. Document:

   * Design purpose and intent
   * Information architecture and reading order
   * Screen and page structure
   * Layout systems
   * Visual hierarchy
   * Typography roles
   * Color and visual tokens
   * Spacing relationships
   * Components and variants
   * Interaction intent
   * Responsive behavior
   * States and edge cases
   * Accessibility intent
   * Assets and iconography
   * Design-system mapping
3. For significant findings, explicitly use:

   * Observed
   * Inferred
   * Recommended
   * Open question
4. Reference the relevant Figma pages, frames, components, or nodes.
5. Map important design decisions to the requirement IDs they support.
6. Describe design intent and relationships, not only raw measurements.
7. Do not turn `DESIGN.md` into:

   * A CSS property dump
   * An implementation plan
   * A copy of `REQUIREMENTS.md`
   * A list of unsupported responsive assumptions
8. Identify deviations, inconsistent components, and patterns that may require design-system additions.

## Review pass 1

Compare the document against the actual Figma source for visual and behavioral completeness.

## Review pass 2

Verify that the design supports `REQUIREMENTS.md` and that inferred design behavior remains clearly labeled.

---

# Stage 4 — Create the technical specification

Deeply analyze:

* The Figma file
* `FIGMA-AUDIT.md`
* `REQUIREMENTS.md`
* `DESIGN.md`
* `Document-Guidelines-SPEC.md`

Your goal is to create or update `SPEC.md`.

## Instructions

1. Follow `Document-Guidelines-SPEC.md`.
2. Translate the requirements and design intent into precise, observable, and testable behavior.
3. Define:

   * Scope and exclusions
   * Terminology
   * Functional behavior
   * Content behavior
   * Conceptual component structure
   * States
   * Interactions
   * Keyboard behavior
   * Focus behavior
   * Responsive behavior
   * Accessibility requirements
   * Data requirements
   * Validation
   * Error handling
   * Edge cases
   * Relevant non-functional requirements
   * Acceptance criteria
4. Preserve and reference the stable identifiers from `REQUIREMENTS.md`.
5. Add specification identifiers where finer-grained traceability is needed.
6. Every material specification must reference:

   * Its requirement ID
   * Its relevant design section or Figma evidence
7. Define behavior for applicable states:

   * Default
   * Hover
   * Focus
   * Active
   * Selected
   * Disabled
   * Loading
   * Empty
   * Error
   * Success
8. Define behavior for relevant edge cases:

   * Long content
   * Missing content
   * Small viewports
   * Slow or failed requests
   * Duplicate actions
   * Invalid data
   * Unsupported content
   * JavaScript failure, where relevant
9. Do not prescribe repository structure, specific modules, or implementation sequencing unless these are genuine constraints.
10. Do not silently resolve open product or design questions. Carry them forward explicitly.

## Review pass 1

Check that every specification can be objectively verified.

## Review pass 2

Check requirement coverage, design consistency, edge-case completeness, accessibility, and responsive behavior.

---

# Stage 5 — Run the documentation consistency gate

Deeply review:

* The Figma file
* `FIGMA-AUDIT.md`
* `REQUIREMENTS.md`
* `DESIGN.md`
* `SPEC.md`

Your goals are to:

1. Correct the affected source documents.
2. Create or update `DOCUMENT-REVIEW.md` as an audit trail.

## Review areas

Check for:

* Contradictory requirements
* Design decisions that do not support a requirement
* Specification behavior not supported by requirements or design
* Missing requirement coverage
* Missing responsive behavior
* Missing accessibility requirements
* Missing component or page states
* Missing validation or error handling
* Missing content behavior
* Unclear data ownership or persistence
* Assumptions presented as facts
* Unsupported numerical thresholds
* Duplicated or competing sources of truth
* Requirements that cannot be tested
* Specification items without requirement references
* Open questions that block implementation
* Implementation risks already visible from the design or specification

## Correction rules

1. Correct each problem in the document that owns the decision:

   * Product expectation → `REQUIREMENTS.md`
   * Design intent → `DESIGN.md`
   * Testable behavior → `SPEC.md`
2. Propagate affected references and traceability links.
3. Do not resolve stakeholder decisions through guesswork.
4. Record in `DOCUMENT-REVIEW.md`:

   * Finding
   * Severity
   * Affected documents
   * Resolution
   * Remaining uncertainty
   * Blocking status

## Completion status

End the review with one of these statuses:

* `Ready for architecture and planning`
* `Ready with documented non-blocking assumptions`
* `Blocked by unresolved decisions`

Perform a second full cross-document review after applying corrections.

---

# Stage 6 — Define the architecture

Use this stage for applications or sites with meaningful routing, state, data flow, integrations, authentication, persistence, build infrastructure, or deployment concerns.

For a genuinely simple static site, document why a separate architecture stage is unnecessary and continue to the planning stage.

Deeply analyze:

* The repository
* The Figma file
* `FIGMA-AUDIT.md`
* `REQUIREMENTS.md`
* `DESIGN.md`
* `SPEC.md`
* `DOCUMENT-REVIEW.md`
* `Document-Guidelines-ARCHITECTURE.md`, when available

Your goal is to create or update `ARCHITECTURE.md`.

## Instructions

Document:

* Existing repository architecture
* System boundaries
* Frontend structure
* Backend structure, when applicable
* Route and navigation organization
* Component boundaries
* Data flow
* State ownership
* API and integration boundaries
* Persistence approach
* Authentication and authorization boundaries
* Styling and design-system integration
* Asset handling
* Error boundaries
* Accessibility architecture
* Testing layers
* Build and deployment structure
* Security considerations
* Observability, where relevant
* Architectural constraints
* Alternatives considered
* Tradeoffs
* Risks
* Open technical decisions

Map important architectural decisions to requirement and specification identifiers.

Do not include detailed implementation sequencing; that belongs in `PLAN.md`.

Perform both required review passes before completing the stage.

---

# Stage 7 — Create the implementation plan

Deeply analyze:

* The repository
* The Figma file
* `FIGMA-AUDIT.md`
* `REQUIREMENTS.md`
* `DESIGN.md`
* `SPEC.md`
* `DOCUMENT-REVIEW.md`
* `ARCHITECTURE.md`, when applicable
* `Document-Guidelines-PLAN.md`

Your goal is to create or update `PLAN.md`.

## Instructions

1. Follow `Document-Guidelines-PLAN.md`.
2. Inspect the repository before naming files, modules, commands, dependencies, or conventions.
3. Document:

   * Current implementation state
   * Included and excluded scope
   * Technical approach
   * Files and modules to create or modify
   * Implementation phases
   * Dependencies and ordering
   * Testing and validation strategy
   * Migration or compatibility work
   * Risks and mitigations
   * Open questions
   * Definition of Done
4. Make every phase produce a meaningful, verifiable result.
5. For every material task, include:

   * Requirement or specification reference
   * Expected file or module impact
   * Dependencies
   * Validation method
6. Distinguish between:

   * Existing files confirmed in the repository
   * Proposed new files
   * Files whose location still requires investigation
7. Avoid vague tasks such as:

   * Build the UI
   * Add responsiveness
   * Add accessibility
   * Test everything
8. Do not include unsupported features merely because they would be useful.
9. Avoid duplicating the full specification inside the plan.

## Review pass 1

Check completeness, technical feasibility, repository accuracy, and task ordering.

## Review pass 2

Check traceability, testability, risks, dependencies, and alignment with the architecture and specification.

---

# Stage 8 — Challenge and refine the implementation plan

Perform an adversarial review of `PLAN.md`.

Deeply analyze:

* `PLAN.md`
* All upstream project documents
* The current repository

Your goals are to:

1. Update `PLAN.md` directly where corrections are needed.
2. Create or update `PLAN-REVIEW.md`.

## Examine the plan for

* Incorrect assumptions about the repository
* Hidden dependencies
* Incorrect phase ordering
* Tasks that are too broad
* Tasks that are unnecessarily fragmented
* Missing integration work
* Missing data or migration work
* Missing loading, error, and empty states
* Missing responsive implementation
* Missing accessibility work
* Missing automated or manual validation
* Regression risks
* Unnecessary abstractions
* Premature dependencies
* Duplicate work
* Security or privacy risks
* Deployment risks
* Rollback or recovery concerns
* Work that is not traceable to a requirement or specification
* Requirements that are not covered by the plan

## Required result

`PLAN-REVIEW.md` must record:

* Finding
* Impact
* Resolution
* Change made to `PLAN.md`
* Remaining risk
* Final readiness status

After applying changes, perform a second end-to-end review of the updated plan.

End with one status:

* `Ready for task decomposition`
* `Ready with documented risks`
* `Blocked by unresolved technical decisions`

---

# Stage 9 — Decompose the plan into implementation tasks

Deeply analyze:

* `PLAN.md`
* `PLAN-REVIEW.md`
* All upstream documents
* The current repository

Your goals are to:

1. Create `TASKS-INDEX.md`.
2. Create one Markdown file for each implementation task.

## Naming convention

Use zero-padded filenames:

```text
Phase-01--Task-01.md
Phase-01--Task-02.md
Phase-02--Task-01.md
Phase-02--Task-02.md
```

Do not use inconsistent names such as:

```text
Phase-1--Task-1.md
Phase-2--Task-01-final.md
task-new.md
```

## `TASKS-INDEX.md`

Include:

* All phases in execution order
* All tasks in execution order
* Task titles
* Status
* Dependencies
* Requirement and specification coverage
* Whether tasks may run in parallel
* Phase completion criteria
* Overall implementation completion criteria

## Required structure for every task file

```md
# Phase 01 — Task 01: Task title

## Status

Not started

## Objective

Describe the single concrete result this task must produce.

## Source references

- PLAN.md:
- Requirement IDs:
- Specification IDs or sections:
- Design references:
- Architecture references:

## Prerequisites

List tasks or decisions that must be complete first.

## Scope

### Included

List work that belongs in this task.

### Excluded

List nearby work that intentionally belongs elsewhere.

## Repository context

Describe the relevant existing files, modules, conventions, and dependencies.

## Files and modules

| Path | Action | Responsibility |
|---|---|---|
| `path/to/file` | Create/Modify/Delete | Purpose |

Mark unconfirmed paths as proposed.

## Implementation steps

Provide an ordered, concrete sequence of changes.

## Validation

List:

- Automated tests
- Type checking
- Linting
- Build verification
- Manual interaction checks
- Responsive checks
- Accessibility checks
- Visual comparison requirements

## Acceptance criteria

Use objective checkboxes linked to the relevant requirements and specifications.

## Risks and considerations

Document task-specific risks, assumptions, and likely regressions.

## Definition of Done

State exactly what must be true for this task to be considered complete.
```

## Task decomposition rules

1. Each task must produce one coherent and independently verifiable result.
2. Tasks must be small enough to execute without re-planning the entire phase.
3. Tasks must not overlap in responsibility.
4. A task must not depend on a later task.
5. Foundation work must precede dependent feature work.
6. Accessibility, responsiveness, error handling, and tests should be integrated into the relevant implementation tasks rather than deferred entirely to a final cleanup phase.
7. Cross-cutting validation may still have its own final task.
8. Do not write implementation code during this stage.
9. Verify that every `PLAN.md` item appears in at least one task.
10. Verify that every must-have requirement and specification is covered by one or more tasks.

Perform both required review passes after generating all task files.

---

# Stage 10 — Implement one task at a time

Select the first uncompleted task whose prerequisites are satisfied.

Deeply analyze:

* The selected task file
* `TASKS-INDEX.md`
* Its referenced requirements, design decisions, specifications, architecture decisions, and plan sections
* The current repository state

## Instructions

1. Implement only the selected task’s defined scope.
2. Inspect every affected repository file before modifying it.
3. Follow existing project conventions unless an approved architecture decision requires a change.
4. Do not silently expand scope.
5. When implementation reveals a documentation error:

   * Record the discrepancy.
   * Update the owning document.
   * Propagate affected references.
   * Adjust the task or plan when necessary.
6. Run all validation defined by the task.
7. Do not mark the task complete when required validation fails.
8. Update:

   * The task status
   * `TASKS-INDEX.md`
   * Relevant documentation
9. Report:

   * Files modified
   * Behavior implemented
   * Validation executed
   * Validation results
   * Deviations from the task
   * Remaining risks
   * Next unblocked task

---

# Stage 11 — Validate the completed implementation

After all implementation tasks are complete, deeply compare:

* The implemented application
* The Figma file
* `REQUIREMENTS.md`
* `DESIGN.md`
* `SPEC.md`
* `ARCHITECTURE.md`
* `PLAN.md`
* All task files

Your goal is to create or update `IMPLEMENTATION-REVIEW.md`.

## Validate

* Requirement coverage
* Acceptance criteria
* Design fidelity
* Component and page states
* Responsive behavior
* Keyboard operation
* Focus order and focus visibility
* Semantic structure
* Screen-reader relationships
* Color contrast
* Reduced-motion behavior
* Content behavior
* Validation and error handling
* Loading, empty, success, and failure states
* Data and API behavior
* Browser and device requirements
* Performance requirements
* Security requirements
* Automated test coverage
* Build, lint, and type-check status
* Deployment readiness
* Regressions in existing functionality

## Required result

For every finding, record:

* Source requirement or specification
* Expected behavior
* Actual behavior
* Severity
* Evidence
* Required correction
* Status

End with one final result:

* `Implementation accepted`
* `Implementation accepted with documented non-blocking deviations`
* `Implementation requires corrections`
