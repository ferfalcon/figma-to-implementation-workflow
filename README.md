# Design-to-Implementation Workflow

A structured, evidence-driven toolkit for turning a Figma file or another design source into a documented, planned, implemented, and validated web project.

The workflow supports AI-assisted and human-led work with explicit source baselines, proportional documentation, accessibility, responsive behavior, repository-aware planning, small implementation tasks, and evidence-backed validation.

## Start here

1. [`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md)
2. [`workflow/Source-Snapshots.md`](workflow/Source-Snapshots.md)
3. [`workflow/Source-Authority.md`](workflow/Source-Authority.md)
4. [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md)
5. [`workflow/Identifier-Conventions.md`](workflow/Identifier-Conventions.md)
6. [`workflow/Validation-Rules.md`](workflow/Validation-Rules.md)
7. [`schemas/README.md`](schemas/README.md)
8. [`ChatGPT-instructions.md`](ChatGPT-instructions.md)

## Workflow overview

```text
Stage 0: SOURCE-BASELINE.md
       + PROJECT-CONTEXT.md
       + WORKFLOW-STATE.md
       + optional workflow-record.json
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

The Lite profile consolidates requirements, design intent, specification, and planning into separate sections of `IMPLEMENTATION-BRIEF.md`. Standard and Full use separate artifacts.

## Repository areas

### `workflow/`

Normative process rules:

- complete stage sequence;
- workflow profiles and execution modes;
- source snapshots and rebaseline behavior;
- source authority and conflict resolution;
- global identifiers;
- validation and acceptance rules.

### `source-adapters/`

Source-format inspection guidance:

- Figma capture and audit;
- Figma file preparation and normalization;
- screenshots and images;
- PDFs;
- existing websites;
- mixed-source projects.

### `guidelines/`

Artifact-specific writing and review guidance for:

- `REQUIREMENTS.md`;
- `DESIGN.md`;
- `SPEC.md`;
- `ARCHITECTURE.md`;
- `PLAN.md`.

### `templates/`

Reusable project artifact structures for Stage 0, audits, Lite briefs, requirements, design, specifications, reviews, architecture, plans, tasks, and final implementation validation.

### `prompts/`

One executable prompt per workflow stage, from intake through final implementation review.

### `schemas/`

Machine-readable workflow control definitions. A project may add `.workflow/workflow-record.json` or any `*.workflow.json` file to enable semantic CI checks without replacing the normative Markdown artifacts.

The executable validator checks identifier uniqueness, references, profile requirements, task dependency cycles, snapshot lineage, completion rules, and validation evidence.

### `examples/`

Non-normative examples organized by Lite, Standard, and Full profiles.

### `scripts/`

Repository integrity and executable workflow tooling. Run:

```bash
node scripts/validate-workflow.mjs
node scripts/test-workflow-record.mjs
```

The first command checks repository structure, Markdown links, JSON syntax, and any discovered project workflow records. The second command verifies that the semantic validator accepts a valid fixture and detects known failures in an invalid fixture.

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

Approved task commits are expected Implementation outputs. Unexpected upstream design, documentation, asset, runtime, or concurrent repository changes require new snapshot IDs and impact assessment.

## Workflow profiles

### Lite

For isolated components, small static pages, and narrow changes without meaningful architecture or integration risk.

### Standard

For multi-page sites, substantial UI features, or meaningful repository integration. Architecture remains conditional.

### Full

For full-stack applications, authentication, persistence, complex integrations, multiple services, migrations, or high security, privacy, deployment, or operational risk.

Every profile requires `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, and `WORKFLOW-STATE.md`.

## Execution modes

- `Gated` — stop after each stage or consolidated Lite artifact until explicitly advanced.
- `Continuous documentation` — continue through documentation and task decomposition while unblocked, then stop before implementation.
- `Task-by-task` — implement one unblocked task at a time after planning approval.

## Artifact ownership

| Artifact | Owns |
|---|---|
| `SOURCE-BASELINE.md` | Source identity, revision, role, pin strength, output lineage, and rebaseline impact |
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
| Workflow record | Machine-readable projection of control state, references, tasks, and lineage for automated checks |

## Repository structure

```text
.
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ChatGPT-instructions.md
├── workflow/
├── source-adapters/
├── guidelines/
├── templates/
├── prompts/
├── schemas/
├── examples/
├── scripts/
├── tests/
└── .github/workflows/
```

## Integrated quality

Accessibility, responsiveness, states, errors, and tests must be implemented with the behavior they affect. A final phase may verify them but must not introduce them for the first time.

Select breakpoints from pinned design evidence, actual layout failure, and repository conventions—not a familiar device number by default.

Identify interaction patterns before prescribing focus behavior. Disclosures, menus, drawers, and modal dialogs do not share identical keyboard rules.

## Two-pass reviews

1. Completeness and correctness.
2. Consistency, traceability, source and output-lineage integrity, risks, and uncertainty after first-pass corrections.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md). Structural changes must pass the repository validator.

## License

No reuse license has been selected yet. See [`LICENSE`](LICENSE) for the current all-rights-reserved notice. Replace it only after the repository owner explicitly chooses a license.
