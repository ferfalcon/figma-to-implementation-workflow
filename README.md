# Design-to-Implementation Workflow

## Figma ↔ GitHub, safely connected through ChatGPT

A single, evidence-driven workflow for turning design intent into validated implementation — whether your strongest side is design or engineering.

Designers do not need to become engineers. Engineers do not need to become advanced Figma practitioners. Connect the project sources, add the workflow, and tell ChatGPT to start. The workflow keeps the handoff scoped, traceable, approval-aware, and validated.

**One workflow. One onboarding. No user route selection.**

[Get started →](QUICKSTART.md)

## The bridge

The workflow is designed for the gap between design and engineering:

| Stronger in design | Stronger in engineering |
|---|---|
| ChatGPT can operate repository and workflow mechanics you may not normally use. | ChatGPT can inspect and, when authorized, prepare Figma structures you may not normally create. |
| A local terminal is not required for the workflow when GitHub execution is available. | Advanced Figma handoff expertise is not required to begin. |
| You keep authority over human approval gates and consequential product decisions. | You keep authority over human approval gates and consequential product decisions. |

The workflow is identical in both cases. User profession, terminal familiarity, or design-tool expertise never selects a different process.

```text
                     Human intent + approvals
                              │
                              ▼
                           ChatGPT
                         /          \
                        /            \
                     Figma          GitHub
                        \            /
                         \          /
                    canonical workflow
                              │
           evidence → requirements → plan → tasks
                              │
                              ▼
                   implementation + validation
```

## Start with ChatGPT

The normal consumer setup is intentionally small:

1. Add the workflow consumer files to the implementation repository.
2. Connect GitHub and Figma to your ChatGPT Project.
3. Copy [`AI-project-settings.md`](AI-project-settings.md) into the ChatGPT Project instructions.
4. Customize the project values at the top of that file.
5. Tell ChatGPT: **“Start the implementation workflow.”**

From there, the agent resolves the project details that should not become user routing questions. It inspects the configured design and repository scope, determines whether design-source preparation is required, classifies the smallest valid workflow profile, discovers the current workflow state, resolves direct versus GitHub-hosted CLI execution, and continues until a real human approval, consequential decision, or capability blocker is reached.

See [`QUICKSTART.md`](QUICKSTART.md) for the complete consumer setup and first-run contract.

## No local terminal required

The workflow has one canonical engine: `design-workflow`.

When the current environment can execute the CLI directly, the agent may use it. When ChatGPT can work through GitHub but has no local CLI, [`workflow/GitHub-Remote-Execution.md`](workflow/GitHub-Remote-Execution.md) lets GitHub Actions run the same pinned canonical CLI. GitHub Issues are only the authenticated command transport; they do not become a second workflow engine or approval mechanism.

The user does not need to choose between “local mode” and “GitHub mode.” Execution transport is a capability-resolution concern owned by agent orchestration.

## Why not just ask ChatGPT to “implement the Figma”?

A one-shot prompt leaves critical questions implicit: which design state is authoritative, what behavior is observed versus inferred, which repository commit was planned against, whether source changes occurred mid-work, which assumptions need human approval, and whether validation actually ran.

This toolkit makes those concerns explicit without requiring the user to manually manage them. It provides:

- pinned or honestly time-bound source baselines;
- evidence classifications and source authority;
- proportional documentation based on project risk;
- explicit human approval gates when required;
- stable traceability from requirements to implementation and validation;
- task-scoped implementation authorization;
- repository/output lineage;
- evidence-backed validation and final review;
- machine-checkable workflow state rather than conversational memory.

The goal is not more ceremony. The goal is to let an agent work across design and engineering **without silently improvising the handoff**.

## One workflow, proportional depth

The workflow always follows the same responsibility chain:

```text
source baseline
    ↓
design audit
    ↓
requirements → design intent → specification
    ↓
consistency review
    ↓
architecture when applicable
    ↓
implementation plan → adversarial review
    ↓
tasks → implementation
    ↓
validation → final review
```

Express, Lite, Standard, and Full are proportional artifact profiles inside that one workflow. They are not different products or user routes. For AI-assisted initialization, [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md) requires the agent to classify the work from actual project complexity and risk and pass the explicit result to the canonical CLI.

[`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md) owns the normative stage responsibilities.

## Design preparation is part of the bridge, not another route

A design source may need cleanup or normalization before the formal developer-handoff audit. For Figma, [`source-adapters/FIGMA-PREPARATION.md`](source-adapters/FIGMA-PREPARATION.md) owns that preparation procedure and [`AGENTS-PROMPT-Figma-file-preparation.md`](AGENTS-PROMPT-Figma-file-preparation.md) remains a narrow launcher for explicit preparation-only tasks.

In normal workflow startup, agent orchestration decides whether preparation is materially required from source evidence. Preparation remains outside executable workflow state and never replaces the formal audit.

## State and agent execution

The toolkit supports one executable control mode and one manual/scaffold mode:

- **CLI-managed:** `.workflow/workflow-record.json` owns mutable executable workflow state and `.workflow/generated/` contains read-only projections. AI-agent orchestration uses this mode.
- **Markdown-only manual/scaffold:** narrative artifacts can be maintained manually, but no executable stage/task state, generated routing, lifecycle enforcement, or agent orchestration exists.

For CLI-managed agent work, [`AGENTS-instructions.md`](AGENTS-instructions.md) is the permanent consumer bootstrap. It delegates executable behavior to [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md) and the exact current resources selected by the workflow runtime.

Do not manually edit `.workflow/workflow-record.json` or `.workflow/generated/*`.

## Consumer bundle

The repository includes a generator for an uploadable consumer package:

```bash
npm run build:consumer-bundle -- --revision <40-character-toolkit-commit-sha>
```

The generated bundle contains:

- `repository/` — files to add to the implementation repository, including the vendored runtime toolkit and the GitHub remote caller;
- `ChatGPT-Project-Instructions.md` — generated directly from `AI-project-settings.md`;
- `consumer-bundle-manifest.json` — bundle format and immutable toolkit identity.

The generated GitHub caller is pinned to the exact revision supplied to the build command. The build intentionally excludes toolkit-development-only files from the vendored consumer payload.

## Advanced and direct usage

You can use the toolkit without ChatGPT as well:

- [`cli/README.md`](cli/README.md) — direct CLI commands and schemas;
- [`schemas/README.md`](schemas/README.md) — machine-readable control definitions;
- [`workflow/GitHub-Remote-Execution.md`](workflow/GitHub-Remote-Execution.md) — GitHub-hosted canonical CLI transport;
- [`workflow/State-Ownership.md`](workflow/State-Ownership.md) — executable state versus generated/narrative ownership.

These are technical surfaces, not separate consumer workflows.

## Repository map

| Area | Responsibility |
|---|---|
| `workflow/` | Normative process contracts: stages, profiles, execution, source authority, state ownership, identifiers, validation, and orchestration |
| `source-adapters/` | Source-specific inspection and preparation guidance |
| `guidelines/` | Artifact-writing and review guidance |
| `templates/` | Reusable project artifact structures and GitHub caller template |
| `prompts/` | Stage-specific and profile-specific executable instructions |
| `cli/` | Dependency-free `design-workflow` CLI and runtime behavior |
| `schemas/` | Machine-readable workflow control definitions |
| `scripts/` and `tests/` | Repository integrity, bundle generation, semantic validation, and regression coverage |
| `AGENTS-instructions.md` | Consumer-agent bootstrap |
| `AGENTS-PROMPT-Figma-file-preparation.md` | Narrow explicit preparation-only launcher |
| `AI-project-settings.md` | ChatGPT Project host template; not workflow-state authority |
| `AGENTS.md` | Toolkit-development instructions |

## Reference contracts

Read these when the current task needs the corresponding domain:

- [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md) — profile eligibility, agent classification, artifact sets, and upgrade rules.
- [`workflow/Source-Snapshots.md`](workflow/Source-Snapshots.md) — source identity, pinning, reverification, and supersession.
- [`workflow/Source-Authority.md`](workflow/Source-Authority.md) — evidence classifications and decision authority.
- [`workflow/State-Ownership.md`](workflow/State-Ownership.md) — record, generated-view, and narrative ownership.
- [`workflow/Identifier-Conventions.md`](workflow/Identifier-Conventions.md) — stable identifiers and traceability namespaces.
- [`workflow/Validation-Rules.md`](workflow/Validation-Rules.md) — validation evidence, review passes, retesting, and final acceptance.
- [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md) — canonical AI-agent runtime behavior, one-workflow intake, preparation/classification, and execution-transport resolution.
- [`workflow/Contract-Compatibility.md`](workflow/Contract-Compatibility.md) — generated contract compatibility map.

## Toolkit development

If you are changing this toolkit rather than consuming it, follow [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md), then run:

```bash
npm run validate
```

## License

Licensed under the MIT License. See [`LICENSE`](LICENSE).
