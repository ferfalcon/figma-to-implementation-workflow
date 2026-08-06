# Design-to-Implementation Workflow

A structured, evidence-driven workflow for turning a Figma file or another design source into a documented, planned, implemented, and validated web project.

The toolkit is designed for AI-assisted and human-led work. It emphasizes design fidelity, accessibility, responsive behavior, pinned source evidence, repository awareness, explicit uncertainty, traceability, stage control, and small reviewable implementation steps.

## Start here

1. Read [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md).
2. Pin source revisions using [`Source-Snapshots.md`](Source-Snapshots.md).
3. Select a proportional profile using [`Workflow-Profiles.md`](Workflow-Profiles.md).
4. Use [`Identifier-Conventions.md`](Identifier-Conventions.md) for stable cross-document IDs.
5. Configure the assistant with [`ChatGPT-instructions.md`](ChatGPT-instructions.md).

## Workflow overview

```text
Stage 0: SOURCE-BASELINE.md
       + PROJECT-CONTEXT.md
       + WORKFLOW-STATE.md
    ↓
Pinned design-source audit
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
IMPLEMENTATION-REVIEW.md against exact snapshots
```

The Lite profile consolidates requirements, design intent, specification, and planning into clearly separated sections of `IMPLEMENTATION-BRIEF.md`. Standard and Full use separate artifacts.

## Source snapshot pinning

A URL alone is not a reliable baseline. Figma files, branches, websites, shared documents, and preview environments can change while retaining the same address.

Every project creates `SOURCE-BASELINE.md` and defines stable snapshot IDs:

```text
SRC-DS-001      Design source
SRC-REPO-001    Repository commit
SRC-RUN-001     Runtime or deployment
SRC-DOC-001     Authoritative documentation
SRC-ASSET-001   Asset bundle or file
```

Snapshots are classified as:

- `Immutable` — commit SHA, checksum-backed file, immutable deployment ID;
- `Versioned` — named or numbered source revision;
- `Time-bound` — inspected at a known time but still mutable;
- `Unverified` — identity or revision could not be confirmed.

A normal Figma design URL or live website observation is normally Time-bound unless a stable version or checksum-backed capture exists.

Every downstream artifact references the snapshot IDs it actually used. When a source changes, create a new ID, assess affected artifacts, and move the workflow back to the earliest affected stage. Never repoint an existing snapshot ID to newer content.

## Stage 0

Every new application of the workflow begins by creating or validating:

- `SOURCE-BASELINE.md` — source identities, revisions, pin strength, evidence, and rebaseline history;
- `PROJECT-CONTEXT.md` — stable scope, constraints, profile, and quality expectations tied to active snapshots;
- `WORKFLOW-STATE.md` — current stage, active snapshot IDs, execution mode, readiness, blockers, and next permitted action.

Stage 0 prevents a new conversation or implementation agent from guessing which source revision applies or whether it should inspect, document, plan, or implement.

## Workflow profiles

### Lite

For isolated components, small static pages, and narrowly scoped changes without meaningful architecture or integration risk.

Primary artifacts:

- `SOURCE-BASELINE.md`
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

Record the selected mode and active snapshots in `WORKFLOW-STATE.md`.

## Document ownership

| Artifact | Owns |
|---|---|
| `SOURCE-BASELINE.md` | Source identity, revision, pin strength, active and superseded snapshots, and rebaseline impact |
| `PROJECT-CONTEXT.md` | Stable project, scope, profile, quality baseline, and active snapshot references |
| `WORKFLOW-STATE.md` | Current operational control, snapshot verification, and next permitted action |
| `DESIGN-AUDIT.md` | Evidence observed in pinned sources and audit findings |
| `REQUIREMENTS.md` | Product outcomes, rules, constraints, and quality expectations |
| `DESIGN.md` | Visual, responsive, content, and interaction intent |
| `SPEC.md` | Precise, observable, testable behavior |
| `ARCHITECTURE.md` | Structural technical decisions and boundaries |
| `PLAN.md` | Repository-aware approach, ordering, dependencies, risks, and validation |
| Task files | Coherent independently verifiable implementation units |
| `IMPLEMENTATION-REVIEW.md` | Final validation against exact snapshots, findings, deviations, and result |

Lite consolidation does not merge these responsibilities; it only places them in separate sections of one brief.

## Architecture is conditional

Create `ARCHITECTURE.md` when meaningful routing, shared state, APIs, persistence, authentication, integrations, build, deployment, security, reliability, observability, or migration decisions exist.

When it is skipped:

1. record the reason in `WORKFLOW-STATE.md`;
2. place behavioral structural constraints in `SPEC.md` or the Lite specification section;
3. place repository and implementation structure in `PLAN.md` or the Lite plan section.

Skipping the artifact never means skipping technical reasoning.

## Templates

Stage 0 templates:

- [`templates/SOURCE-BASELINE.template.md`](templates/SOURCE-BASELINE.template.md)
- [`templates/PROJECT-CONTEXT.template.md`](templates/PROJECT-CONTEXT.template.md)
- [`templates/WORKFLOW-STATE.template.md`](templates/WORKFLOW-STATE.template.md)

Core control and profile templates:

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

Templates are starting structures. They do not override pinned evidence, approved decisions, the target repository, or matching guidelines.

## Artifact baseline metadata

Artifacts created after Stage 0 should include compact metadata such as:

```yaml
---
artifact: SPEC
status: Draft
baseline:
  design:
    - SRC-DS-001
  repository:
    - SRC-REPO-001
  runtime: []
  documentation:
    - SRC-DOC-001
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

The full source details remain in `SOURCE-BASELINE.md`.

## Identifier system

Use globally distinct namespaces such as:

```text
SRC-DS-001
SRC-REPO-001
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

Do not reuse a requirement ID as a specification ID. Never renumber or reuse an ID after it has been referenced. Never repoint a snapshot ID to different content.

## Integrated implementation quality

Accessibility, responsiveness, states, errors, and tests must be implemented with the component, interaction, or feature they affect. A final phase may verify these concerns, but must not be where they are first added.

Responsive breakpoints should be selected from pinned design evidence, actual content or layout failure, and existing project conventions—not from a familiar device number by default.

Interaction specifications must identify the intended pattern before prescribing focus behavior. Disclosures, menus, drawers, and modal dialogs do not share identical keyboard and focus requirements.

## Two-pass review model

Every documentation and planning review uses two distinct passes:

1. completeness and correctness;
2. consistency, traceability, source integrity, risks, and uncertainty after first-pass corrections.

Rereading the same material without changing review focus does not satisfy the requirement.

## Expected outcome

A successful application produces:

- an explicit, reproducible or honestly time-bound source baseline;
- controlled stage advancement;
- evidence-based design understanding;
- proportional documentation;
- distinct and traceable decisions;
- repository-aware planning tied to a commit;
- small executable tasks;
- integrated accessibility and responsive behavior;
- validated implementation against exact design, repository, and runtime snapshots;
- honest source limitations, deviations, and remaining risks.
