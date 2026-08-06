# Design-to-Implementation Workflow

A structured, evidence-driven workflow for turning a Figma file or another design source into a documented, planned, implemented, and validated web project.

The toolkit is designed for AI-assisted and human-led work. It emphasizes design fidelity, accessibility, responsive behavior, repository evidence, explicit uncertainty, traceability, stage control, and small reviewable implementation steps.

## Start here

1. Read [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md).
2. Select a proportional profile using [`Workflow-Profiles.md`](Workflow-Profiles.md).
3. Use [`Identifier-Conventions.md`](Identifier-Conventions.md) for stable cross-document IDs.
4. Configure the assistant with [`ChatGPT-instructions.md`](ChatGPT-instructions.md).

## Workflow overview

```text
Stage 0: PROJECT-CONTEXT.md + WORKFLOW-STATE.md
    ↓
Design-source audit
    ↓
Requirements → Design intent → Specification
    ↓
Documentation consistency gate
    ↓
Architecture, when applicable
    ↓
Implementation plan → Adversarial plan review
    ↓
Tasks → One-task-at-a-time implementation
    ↓
IMPLEMENTATION-REVIEW.md
```

The Lite profile consolidates requirements, design intent, specification, and planning into clearly separated sections of `IMPLEMENTATION-BRIEF.md`. Standard and Full use separate artifacts.

## Stage 0

Every new application of the workflow begins by creating or validating:

- `PROJECT-CONTEXT.md` — stable scope, source, repository baseline, constraints, profile, and quality expectations;
- `WORKFLOW-STATE.md` — current stage, execution mode, readiness, blockers, approved artifacts, and next permitted action.

Stage 0 prevents a new conversation or implementation agent from guessing whether it should inspect, document, plan, or implement.

## Workflow profiles

### Lite

For isolated components, small static pages, and narrowly scoped changes without meaningful architecture or integration risk.

Primary artifacts:

- `PROJECT-CONTEXT.md`
- `WORKFLOW-STATE.md`
- `DESIGN-AUDIT.md`
- `IMPLEMENTATION-BRIEF.md`
- one task file or a proportional task set
- `IMPLEMENTATION-REVIEW.md`

### Standard

For multi-page sites, substantial UI features, or meaningful repository integration.

Uses separate requirements, design, specification, review, plan, plan-review, task, and final-review artifacts. Architecture remains conditional.

### Full

For full-stack applications, authentication, persistence, complex integrations, multiple services, migrations, or high security, privacy, deployment, or operational risk.

Uses the complete workflow including architecture and architecture decision records when required.

## Execution modes

- `Gated` — stop after every stage or consolidated Lite artifact until explicitly advanced.
- `Continuous documentation` — continue through documentation and task decomposition while unblocked, but stop before implementation.
- `Task-by-task` — after planning approval, implement one unblocked task at a time.

Record the selected mode in `WORKFLOW-STATE.md`.

## Document ownership

| Artifact | Owns |
|---|---|
| `PROJECT-CONTEXT.md` | Stable project, source, repository, scope, profile, and quality baseline |
| `WORKFLOW-STATE.md` | Current operational control and next permitted action |
| `DESIGN-AUDIT.md` | Observed evidence and audit findings |
| `REQUIREMENTS.md` | Product outcomes, rules, constraints, and quality expectations |
| `DESIGN.md` | Visual, responsive, content, and interaction intent |
| `SPEC.md` | Precise, observable, testable behavior |
| `ARCHITECTURE.md` | Structural technical decisions and boundaries |
| `PLAN.md` | Repository-aware approach, ordering, dependencies, risks, and validation |
| Task files | Coherent independently verifiable implementation units |
| `IMPLEMENTATION-REVIEW.md` | Final validation evidence, findings, deviations, and result |

Lite consolidation does not merge these responsibilities; it only places them in separate sections of one brief.

## Architecture is conditional

Create `ARCHITECTURE.md` when meaningful routing, shared state, APIs, persistence, authentication, integrations, build, deployment, security, reliability, observability, or migration decisions exist.

When it is skipped:

1. record the reason in `WORKFLOW-STATE.md`;
2. place behavioral structural constraints in `SPEC.md` or the Lite specification section;
3. place repository and implementation structure in `PLAN.md` or the Lite plan section.

Skipping the artifact never means skipping technical reasoning.

## Templates

Core control and profile templates:

- [`templates/PROJECT-CONTEXT.template.md`](templates/PROJECT-CONTEXT.template.md)
- [`templates/WORKFLOW-STATE.template.md`](templates/WORKFLOW-STATE.template.md)
- [`templates/IMPLEMENTATION-BRIEF.template.md`](templates/IMPLEMENTATION-BRIEF.template.md)

Core Standard and Full templates:

- [`templates/DESIGN-AUDIT.template.md`](templates/DESIGN-AUDIT.template.md)
- [`templates/REQUIREMENTS.template.md`](templates/REQUIREMENTS.template.md)
- [`templates/DESIGN.template.md`](templates/DESIGN.template.md)
- [`templates/SPEC.template.md`](templates/SPEC.template.md)
- [`templates/DOCUMENT-REVIEW.template.md`](templates/DOCUMENT-REVIEW.template.md)
- [`templates/ARCHITECTURE.template.md`](templates/ARCHITECTURE.template.md)
- [`templates/PLAN.template.md`](templates/PLAN.template.md)
- [`templates/PLAN-REVIEW.template.md`](templates/PLAN-REVIEW.template.md)
- [`templates/TASKS-INDEX.template.md`](templates/TASKS-INDEX.template.md)
- [`templates/TASK.template.md`](templates/TASK.template.md)
- [`templates/IMPLEMENTATION-REVIEW.template.md`](templates/IMPLEMENTATION-REVIEW.template.md)

Templates are starting structures. They do not override evidence, approved project decisions, the target repository, or matching guidelines.

## Identifier system

Use globally distinct namespaces such as:

```text
EVD-001
REQ-FR-001
REQ-AR-001
DES-001
DES-RWD-001
DES-INT-001
SPEC-BEH-001
SPEC-ACC-001
AC-001
ADR-001
PLAN-001
P01-T01
DOC-001
PLANREV-001
IMPL-001
```

Do not reuse a requirement ID as a specification ID. Never renumber or reuse an ID after it has been referenced.

## Integrated implementation quality

Accessibility, responsiveness, states, errors, and tests must be implemented with the component, interaction, or feature they affect. A final phase may verify these concerns, but must not be where they are first added.

Responsive breakpoints should be selected from design evidence, actual content or layout failure, and existing project conventions—not from a familiar device number by default.

Interaction specifications must identify the intended pattern before prescribing focus behavior. Disclosures, menus, drawers, and modal dialogs do not share identical keyboard and focus requirements.

## Two-pass review model

Every documentation and planning review uses two distinct passes:

1. completeness and correctness;
2. consistency, traceability, risks, and uncertainty after first-pass corrections.

Rereading the same material without changing review focus does not satisfy the requirement.

## Expected outcome

A successful application produces:

- an explicit project and source baseline;
- controlled stage advancement;
- evidence-based design understanding;
- proportional documentation;
- distinct and traceable decisions;
- repository-aware planning;
- small executable tasks;
- integrated accessibility and responsive behavior;
- validated implementation with honest evidence and remaining risks.
