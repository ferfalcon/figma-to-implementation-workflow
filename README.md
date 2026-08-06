# Design-to-Implementation Workflow

A structured, evidence-driven toolkit for turning a Figma file or another design source into a documented, planned, implemented, and validated web project.

It emphasizes design fidelity, accessibility, responsive behavior, pinned sources, repository awareness, explicit uncertainty, traceability, stage control, and small reviewable implementation steps.

## Start here

1. [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md)
2. [`Source-Snapshots.md`](Source-Snapshots.md)
3. [`Workflow-Profiles.md`](Workflow-Profiles.md)
4. [`Identifier-Conventions.md`](Identifier-Conventions.md)
5. [`ChatGPT-instructions.md`](ChatGPT-instructions.md)

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
Pinned implementation output + validation runtime
    ↓
IMPLEMENTATION-REVIEW.md
```

Lite consolidates requirements, design intent, specification, and planning into separate sections of `IMPLEMENTATION-BRIEF.md`. Standard and Full use separate artifacts.

## Source snapshots

A URL alone is not a reliable baseline. Figma files, websites, branches, shared documents, and preview environments can change without changing address.

Every project creates `SOURCE-BASELINE.md` with stable IDs:

```text
SRC-DS-001      Design source
SRC-REPO-001    Repository state
SRC-RUN-001     Runtime or deployment
SRC-DOC-001     Documentation
SRC-ASSET-001   Asset bundle or file
```

Pin strength:

- `Immutable` — commit SHA, checksum-backed file, immutable deployment ID;
- `Versioned` — named or numbered revision;
- `Time-bound` — inspected at a known time but still mutable;
- `Unverified` — identity or revision could not be confirmed.

A normal Figma URL or website observation is normally Time-bound unless a stable version or checksum-backed capture exists.

## Inputs versus implementation outputs

Snapshot category and workflow role are separate.

Common roles:

- Input baseline
- Supporting source
- Task start
- Implementation output
- Validation runtime
- Historical reference

Approved task commits are expected outputs. They create new `SRC-REPO-*` Implementation output records and advance repository lineage. They do not supersede the original input baseline or reopen earlier stages automatically.

Unexpected upstream design, documentation, asset, runtime, or concurrent repository changes require new snapshot IDs, impact assessment, and movement to the earliest affected stage when necessary.

## Stage 0

Create or validate:

- `SOURCE-BASELINE.md` — source identity, revision, role, pin strength, evidence, implementation lineage, and rebaseline history;
- `PROJECT-CONTEXT.md` — project scope, profile, constraints, quality baseline, and active input references;
- `WORKFLOW-STATE.md` — stage, active inputs, task-start and output snapshots, execution mode, readiness, blockers, and next action.

Stage 0 prevents agents from guessing which source revision applies or whether they should inspect, document, plan, or implement.

## Workflow profiles

### Lite

For isolated components, small static pages, and narrow changes without meaningful architecture or integration risk.

### Standard

For multi-page sites, substantial UI features, or meaningful repository integration. Architecture remains conditional.

### Full

For full-stack applications, authentication, persistence, complex integrations, multiple services, migrations, or high security, privacy, deployment, or operational risk.

Every profile requires the three Stage 0 control artifacts.

## Execution modes

- `Gated` — stop after each stage or consolidated Lite artifact until explicitly advanced.
- `Continuous documentation` — continue through documentation and task decomposition while unblocked, then stop before implementation.
- `Task-by-task` — implement one unblocked task at a time after planning approval.

## Artifact ownership

| Artifact | Owns |
|---|---|
| `SOURCE-BASELINE.md` | Source identity, revision, role, pin strength, repository output lineage, and upstream rebaseline impact |
| `PROJECT-CONTEXT.md` | Stable project scope, profile, quality baseline, and input references |
| `WORKFLOW-STATE.md` | Operational control, verification, lineage, blockers, and next action |
| `DESIGN-AUDIT.md` | Evidence observed within pinned design snapshots |
| `REQUIREMENTS.md` | Product outcomes, rules, constraints, and quality expectations |
| `DESIGN.md` | Visual, responsive, content, and interaction intent |
| `SPEC.md` | Precise, observable, testable behavior |
| `ARCHITECTURE.md` | Structural technical decisions and boundaries |
| `PLAN.md` | Repository-aware approach, ordering, dependencies, risks, and validation |
| Task files | Task-start state, coherent implementation scope, validation, and output lineage |
| `IMPLEMENTATION-REVIEW.md` | Final validation against exact inputs, implementation output, and runtime |

## Templates

Stage 0:

- [`templates/SOURCE-BASELINE.template.md`](templates/SOURCE-BASELINE.template.md)
- [`templates/PROJECT-CONTEXT.template.md`](templates/PROJECT-CONTEXT.template.md)
- [`templates/WORKFLOW-STATE.template.md`](templates/WORKFLOW-STATE.template.md)

Workflow artifacts:

- [`templates/DESIGN-AUDIT.template.md`](templates/DESIGN-AUDIT.template.md)
- [`templates/IMPLEMENTATION-BRIEF.template.md`](templates/IMPLEMENTATION-BRIEF.template.md)
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

## Artifact baseline metadata

Artifacts created after Stage 0 identify the snapshots they used:

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

The complete source details remain in `SOURCE-BASELINE.md`.

## Architecture is conditional

When architecture is skipped:

1. record the reason in `WORKFLOW-STATE.md`;
2. place behavioral structural constraints in `SPEC.md` or the Lite specification section;
3. place repository and implementation structure in `PLAN.md` or the Lite plan section.

## Integrated quality

Accessibility, responsiveness, states, errors, and tests must be implemented with the behavior they affect. A final phase may verify them but must not introduce them for the first time.

Select breakpoints from pinned design evidence, actual layout failure, and repository conventions—not a familiar device number by default.

Identify interaction patterns before prescribing focus behavior. Disclosures, menus, drawers, and modal dialogs do not share identical keyboard rules.

## Two-pass reviews

1. Completeness and correctness.
2. Consistency, traceability, source and output-lineage integrity, risks, and uncertainty after first-pass corrections.

## Expected outcome

A successful application produces:

- reproducible or honestly time-bound source inputs;
- controlled stage advancement;
- evidence-based and proportional documentation;
- repository-aware planning tied to commits;
- small tasks with explicit start and output snapshots;
- integrated accessibility and responsive behavior;
- validated implementation against exact design inputs, implementation output, and runtime;
- honest limitations, deviations, and remaining risks.
