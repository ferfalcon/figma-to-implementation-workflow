# Design-to-Implementation Workflow

A structured, evidence-driven workflow for turning a design source into a documented, planned, implemented, and validated web project.

The workflow is designed for AI-assisted and human-led implementation. It emphasizes design fidelity, responsive behavior, accessibility, repository evidence, explicit uncertainty, traceability, and small reviewable implementation steps.

A design source may be:

- a Figma file;
- screenshots or images;
- a PDF;
- an existing website;
- another structured design artifact.

Figma-specific inspection is used only when the source provides Figma concepts such as pages, frames, nodes, components, variants, variables, styles, and prototypes.

## Start here

Read [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md).

It defines the complete eleven-stage process:

```text
Design source
    ↓
DESIGN-AUDIT.md
    ↓
REQUIREMENTS.md
    ↓
DESIGN.md
    ↓
SPEC.md
    ↓
DOCUMENT-REVIEW.md
    ↓
ARCHITECTURE.md, when applicable
    ↓
PLAN.md
    ↓
PLAN-REVIEW.md
    ↓
TASKS-INDEX.md + task files
    ↓
Implementation
    ↓
IMPLEMENTATION-REVIEW.md
```

## What this repository contains

This repository is a reusable workflow toolkit. It contains:

- project instructions for an AI assistant;
- the complete design-to-implementation workflow;
- document-specific writing guidelines;
- reusable project-document templates;
- non-normative architecture examples.

The project-specific documents created while applying the workflow should normally be stored in the target implementation repository, not in this toolkit repository.

## Quick start

### 1. Prepare the project context

Make the following sources available:

- the design source;
- the target implementation repository;
- existing stakeholder or product documentation;
- API, deployment, design-system, or technical documentation when relevant.

Do not begin implementation from the design source alone when a repository or authoritative project documentation already exists.

### 2. Configure the assistant

Use [`ChatGPT-instructions.md`](ChatGPT-instructions.md) as the project instruction baseline.

Update these placeholders before starting:

```md
- Design source: <url or file reference>
- Repository: <url>
- Live site: <url>
```

The live-site value may remain empty when no deployed version exists.

### 3. Open the workflow

Follow [`Design-Implementation-Workflow.md`](Design-Implementation-Workflow.md) from Stage 1.

Do not skip directly to implementation unless the earlier artifacts already exist and have been reviewed against the current design source and repository.

### 4. Create artifacts in the target repository

Use the matching template when one exists. Apply the relevant guideline file instead of copying generic explanatory content.

Templates are starting structures. Remove sections that do not apply and add project-specific sections when necessary.

### 5. Implement one task at a time

After the plan has passed its adversarial review:

1. Create `TASKS-INDEX.md`.
2. Create one Markdown file per implementation task.
3. Select the first incomplete task whose prerequisites are satisfied.
4. Implement only that task's scope.
5. Run its required validation.
6. Update task status and traceability before continuing.

## Workflow stages

| Stage | Purpose | Primary artifact |
|---:|---|---|
| 1 | Audit the design source and establish evidence | `DESIGN-AUDIT.md` |
| 2 | Define product outcomes, rules, and constraints | `REQUIREMENTS.md` |
| 3 | Document visual, responsive, and interaction intent | `DESIGN.md` |
| 4 | Define precise, testable behavior | `SPEC.md` |
| 5 | Review documentation for contradictions and gaps | `DOCUMENT-REVIEW.md` |
| 6 | Define structural technical decisions when needed | `ARCHITECTURE.md` |
| 7 | Plan implementation against the real repository | `PLAN.md` |
| 8 | Challenge and correct the implementation plan | `PLAN-REVIEW.md` |
| 9 | Decompose the plan into executable units | `TASKS-INDEX.md` and task files |
| 10 | Implement and validate one task at a time | Code and updated task files |
| 11 | Validate the completed implementation | `IMPLEMENTATION-REVIEW.md` |

## Architecture is conditional

A separate `ARCHITECTURE.md` is appropriate when the project has meaningful structural decisions involving areas such as:

- multiple applications, packages, services, or runtime boundaries;
- routing or significant component boundaries;
- shared state or complex data flow;
- APIs or third-party integrations;
- persistence or migrations;
- authentication or authorization;
- build, deployment, security, reliability, or observability.

For a genuinely small static page or isolated component with no meaningful architectural decisions:

1. Record why the architecture stage was skipped.
2. Preserve the necessary structural decisions in `SPEC.md` or `PLAN.md`.
3. Treat architecture references as optional in later stages.

Skipping `ARCHITECTURE.md` does not mean skipping technical reasoning.

## Document ownership

Each project document has a distinct responsibility.

| Document | Owns | Does not own |
|---|---|---|
| `DESIGN-AUDIT.md` | Evidence observed in the design source | Product decisions or implementation choices |
| `REQUIREMENTS.md` | Product outcomes, rules, constraints, and quality expectations | Detailed visual design or file-level implementation |
| `DESIGN.md` | Visual, responsive, content, and interaction intent | Repository structure or implementation ordering |
| `SPEC.md` | Precise, observable, testable behavior | File paths, task ordering, or unsupported architecture |
| `DOCUMENT-REVIEW.md` | Audit trail for documentation findings and corrections | A competing source of product or design decisions |
| `ARCHITECTURE.md` | System boundaries, responsibilities, dependencies, and technical decisions | Detailed implementation sequence |
| `PLAN.md` | Technical approach, files, phases, dependencies, risks, and validation | New product requirements |
| `PLAN-REVIEW.md` | Audit trail for adversarial plan review | A replacement implementation plan |
| `TASKS-INDEX.md` | Authoritative task order, status, dependencies, and coverage | Detailed implementation instructions for every task |
| Task files | One coherent, independently verifiable implementation unit | Unrelated refactors or silently expanded scope |
| `IMPLEMENTATION-REVIEW.md` | Final validation evidence, findings, deviations, and result | Unsupported claims that checks passed |

When sources conflict, identify the conflict and correct the document that owns the decision. Do not silently choose an interpretation.

## Evidence and uncertainty

Use these labels consistently:

- **Confirmed:** established by authoritative documentation or a user decision.
- **Observed:** directly visible in the design source or repository.
- **Inferred:** strongly suggested but not confirmed.
- **Recommended:** proposed to resolve a gap or risk.
- **Open question:** cannot be determined safely from available evidence.

Never present an inference or recommendation as confirmed.

## Repository structure

```text
.
├── README.md
├── ChatGPT-instructions.md
├── Design-Implementation-Workflow.md
├── Document-Guidelines-REQUIREMENTS.md
├── Document-Guidelines-DESIGN.md
├── Document-Guidelines-SPEC.md
├── Document-Guidelines-ARCHITECTURE.md
├── Document-Guidelines-PLAN.md
├── templates/
│   ├── ARCHITECTURE.template.md
│   ├── DESIGN-AUDIT.template.md
│   ├── DOCUMENT-REVIEW.template.md
│   ├── IMPLEMENTATION-REVIEW.template.md
│   ├── PLAN-REVIEW.template.md
│   ├── TASK.template.md
│   └── TASKS-INDEX.template.md
└── examples/
    ├── ARCHITECTURE-component-example.md
    └── ARCHITECTURE-full-stack-example.md
```

## Guidelines

Guideline files explain the responsibility, expected content, quality criteria, and common failure modes of each main document.

- [`Document-Guidelines-REQUIREMENTS.md`](Document-Guidelines-REQUIREMENTS.md)
- [`Document-Guidelines-DESIGN.md`](Document-Guidelines-DESIGN.md)
- [`Document-Guidelines-SPEC.md`](Document-Guidelines-SPEC.md)
- [`Document-Guidelines-ARCHITECTURE.md`](Document-Guidelines-ARCHITECTURE.md)
- [`Document-Guidelines-PLAN.md`](Document-Guidelines-PLAN.md)

Apply the guideline to the project. Do not copy its generic teaching content into the project artifact.

## Templates

Templates provide reusable structure for workflow artifacts.

- [`templates/DESIGN-AUDIT.template.md`](templates/DESIGN-AUDIT.template.md)
- [`templates/DOCUMENT-REVIEW.template.md`](templates/DOCUMENT-REVIEW.template.md)
- [`templates/ARCHITECTURE.template.md`](templates/ARCHITECTURE.template.md)
- [`templates/PLAN-REVIEW.template.md`](templates/PLAN-REVIEW.template.md)
- [`templates/TASKS-INDEX.template.md`](templates/TASKS-INDEX.template.md)
- [`templates/TASK.template.md`](templates/TASK.template.md)
- [`templates/IMPLEMENTATION-REVIEW.template.md`](templates/IMPLEMENTATION-REVIEW.template.md)

A template does not override:

- the matching guideline;
- the design source;
- authoritative project documentation;
- repository evidence;
- an approved project decision.

## Examples

Architecture examples are intentionally separated from normative guidance:

- [`examples/ARCHITECTURE-full-stack-example.md`](examples/ARCHITECTURE-full-stack-example.md)
- [`examples/ARCHITECTURE-component-example.md`](examples/ARCHITECTURE-component-example.md)

Their technologies, directory structures, hosting providers, authentication choices, and architectural patterns are illustrative only.

Do not adopt an example pattern unless it is supported by the target repository, requirements, constraints, or an explicitly approved architectural decision.

## Traceability

Important work should remain traceable across the complete chain:

```text
Design-source evidence
    → requirement ID
    → design decision
    → specification or acceptance criterion
    → architecture decision, when applicable
    → plan item
    → task
    → implementation
    → test or validation evidence
```

Stable IDs should be preserved after creation. When a decision changes, update affected references rather than creating disconnected replacements.

## Review model

Every documentation and planning stage uses two distinct review passes:

1. **Completeness and correctness**
2. **Consistency, traceability, risks, and uncertainty**

The second pass must occur after corrections from the first pass have been applied.

A request to "review twice" does not mean rereading the same text without changing the review focus.

## Implementation principles

The workflow expects implementation to:

- follow the actual repository's conventions;
- use semantic HTML and native controls where possible;
- support keyboard access and visible focus;
- preserve accessible names, relationships, announcements, reflow, contrast, touch targets, and reduced motion;
- define responsive behavior between supplied design widths;
- handle applicable loading, empty, error, success, disabled, long-content, missing-content, and failed-request states;
- avoid unsupported dependencies and premature abstractions;
- keep changes small and reviewable;
- run relevant validation before declaring work complete.

Do not claim a build, test, lint, type check, accessibility review, or manual check passed unless it was actually executed successfully.

## Typical usage patterns

### Complete project

Use all stages, including architecture when the project has meaningful structural decisions.

### Small static site

Use the full documentation and review sequence, but skip a separate architecture artifact when the skip is justified and structural decisions are preserved in the plan.

### Isolated component

Limit the design-source audit and documents to the component's relevant scope. Keep task decomposition proportional to the work while preserving responsive, state, accessibility, and validation requirements.

### Existing implementation

Document the current repository before proposing a target architecture or plan. Separate:

- observed current structure;
- proposed target structure;
- temporary transitional structure.

Do not describe proposed files or patterns as if they already exist.

## Expected outcome

A successful application of this workflow produces:

- an evidence-based understanding of the design source;
- explicit and testable requirements;
- documented design intent;
- a precise behavioral specification;
- reviewed structural decisions when needed;
- a repository-aware implementation plan;
- small traceable implementation tasks;
- validated code;
- an honest final review with evidence, deviations, and remaining risks.
