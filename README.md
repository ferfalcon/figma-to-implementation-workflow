# Design-to-Implementation Workflow

A structured, evidence-driven toolkit for turning a Figma file or another design source into a documented, planned, implemented, and validated web project.

The workflow supports AI-assisted and human-led work with reproducible source baselines, proportional documentation, repository-aware planning, implementation traceability, accessibility, responsive behavior, and evidence-backed validation.

## Start here

Choose the entry point that matches what you are trying to do:

| Goal | Start with |
|---|---|
| Run a first workflow | [`QUICKSTART.md`](QUICKSTART.md) |
| Understand the complete workflow | [`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md) |
| Choose the right workflow depth | [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md) |
| Operate the workflow as an AI agent | [`AGENTS-instructions.md`](AGENTS-instructions.md) and [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md) |
| Use or integrate the CLI | [`cli/README.md`](cli/README.md) |
| Understand machine-readable control | [`schemas/README.md`](schemas/README.md) |
| Develop or contribute to this toolkit | [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) |

For source baselines, authority, state ownership, identifiers, and validation rules, use the focused references in [`workflow/`](workflow/).

## Workflow at a glance

```text
Identify and pin sources
        ↓
Audit the design evidence
        ↓
Define requirements, design intent, and behavior
        ↓
Review documentation consistency
        ↓
Define architecture when required
        ↓
Plan and challenge the implementation approach
        ↓
Decompose into executable tasks
        ↓
Implement against verified repository lineage
        ↓
Validate the exact implementation output
```

The exact stages, gates, artifacts, and transition rules are defined in [`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md).

## Workflow profiles

The workflow scales documentation depth to the complexity and risk of the work:

| Profile | Intended shape |
|---|---|
| **Express** | One narrow implementation result consolidated in `WORKPACK.md` |
| **Lite** | Small work with separate control/audit artifacts and a consolidated implementation brief |
| **Standard** | Substantial UI or repository integration with separate core artifacts |
| **Full** | Complex application work with explicit architecture and broader operational concerns |

Profile selection, eligibility, upgrade triggers, required artifacts, and execution modes are owned by [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md).

## Operational model

The toolkit supports two control modes:

- **CLI-managed:** `.workflow/workflow-record.json` owns executable mutable state and generated Markdown is read-only projection state.
- **Markdown-only:** narrative artifacts carry the manually maintained fallback controls when no workflow record exists.

Do not mix ownership for the same mutable field. See [`workflow/State-Ownership.md`](workflow/State-Ownership.md) for the canonical ownership model and [`cli/README.md`](cli/README.md) for commands.

## Source and validation model

The workflow is designed around explicit evidence rather than mutable URLs or undocumented assumptions:

- [`workflow/Source-Snapshots.md`](workflow/Source-Snapshots.md) defines reproducible design, repository, runtime, documentation, and asset baselines.
- [`workflow/Source-Authority.md`](workflow/Source-Authority.md) defines which source owns a decision when evidence conflicts.
- [`workflow/Identifier-Conventions.md`](workflow/Identifier-Conventions.md) defines stable IDs used for traceability.
- [`workflow/Validation-Rules.md`](workflow/Validation-Rules.md) defines evidence, review, retesting, and final acceptance rules.

## Repository areas

| Area | Responsibility |
|---|---|
| [`workflow/`](workflow/) | Normative process rules, profiles, source/state semantics, identifiers, validation, and agent orchestration |
| [`source-adapters/`](source-adapters/) | Inspection guidance for Figma, screenshots, PDFs, websites, and mixed-source projects |
| [`guidelines/`](guidelines/) | Artifact-writing and review guidance |
| [`templates/`](templates/) | Reusable workflow artifact structures |
| [`prompts/`](prompts/) | Express and stage-specific executable prompts |
| [`cli/`](cli/) | The dependency-free `design-workflow` CLI |
| [`schemas/`](schemas/) | Machine-readable workflow control definitions |
| [`examples/`](examples/) | Non-normative examples for the workflow profiles |
| [`scripts/`](scripts/) | Repository integrity, semantic validation, generated-state checks, and integration tests |
| [`tests/`](tests/) | Validator and CLI fixtures used by the repository test suite |

For Figma preparation specifically, [`AGENTS-PROMPT-Figma-file-preparation.md`](AGENTS-PROMPT-Figma-file-preparation.md) is a thin launcher; [`source-adapters/FIGMA-PREPARATION.md`](source-adapters/FIGMA-PREPARATION.md) owns the normative procedure.

## AI-agent execution

AI agents consuming the workflow should start from [`AGENTS-instructions.md`](AGENTS-instructions.md). The canonical execution boundary, resource-loading model, stage-local behavior, and CLI/agent responsibilities are defined in [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md).

This separation keeps the README useful for orientation without making it another workflow execution contract.

## Validate the toolkit

For repository development, run the complete validation suite:

```bash
npm run validate
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contributor expectations and targeted checks.

## License

Licensed under the MIT License. See [`LICENSE`](LICENSE).
