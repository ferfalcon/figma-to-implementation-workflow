# Quickstart: Start the Implementation Workflow

This is the normal human onboarding path for CLI-managed workflow execution with ChatGPT. The workflow is the same whether your strongest discipline is design or engineering.

You do **not** need to choose a workflow profile or decide whether the workflow should run through a local terminal or GitHub Actions. Agent orchestration resolves those details from project evidence and available capabilities before initialization.

Markdown-only is a manual/scaffold mode for producing narrative artifacts without executable workflow state, generated routing, or agent orchestration. This quickstart does not use that mode.

## What you need

- a Git repository with at least one commit;
- a precisely identifiable Figma/design source and authorized scope;
- a ChatGPT Project with access to the implementation repository and design source;
- permission for ChatGPT to add the workflow's thin GitHub caller to the implementation repository when remote execution is needed.

A local terminal is not required for normal ChatGPT-driven use.

## 1. Connect the project sources to ChatGPT

In the ChatGPT Project, connect the tools needed for the project:

- GitHub for the implementation repository;
- Figma for design inspection and authorized design changes;
- optional deployment/runtime tools such as Vercel when they apply.

The workflow uses GitHub as the repository environment and Figma as the design source. The user should not need to copy the workflow toolkit into the project or run installation commands from a terminal.

## 2. Add the ChatGPT Project Instructions

Copy [`AI-project-settings.md`](AI-project-settings.md) into the ChatGPT Project instructions.

Customize the project values at the top:

```text
Project: <PROJECT_NAME>
Repository: <REPOSITORY_URL>
Figma: <FIGMA_URL>
Figma scope: <FIGMA_SCOPE>
Implementation root: <IMPLEMENTATION_ROOT>
Vercel: <VERCEL_URL>
Production: <PRODUCTION_URL>
```

`Implementation root` is repository-relative: use `.` for the repository root, or a path such as `frontend/` or `apps/web/` when the application lives in a nested directory.

`Vercel` and `Production` are optional when they do not apply.

In normal setup, these project values are the only lines you need to customize. The canonical workflow repository and bootstrap rules are part of the Project Instructions and are not another user configuration choice.

## 3. Install the workflow

Tell ChatGPT:

> **Install the Design-to-Implementation Workflow in this repository.**

This is a setup action, not a second workflow route.

ChatGPT should:

1. inspect the implementation repository's default branch;
2. inspect `.github/workflows/design-workflow-command.yml` when it already exists;
3. if a valid caller is already installed, preserve its exact pinned toolkit revision;
4. otherwise resolve the canonical `ferfalcon/figma-to-implementation-workflow` repository's current default-branch HEAD once to an exact 40-character Git commit SHA;
5. load `AGENTS-instructions.md` from that exact toolkit revision;
6. install only the thin GitHub caller on the implementation repository's default branch, pinned to that same exact revision, when remote execution is required and repository mutation is authorized;
7. verify the installed caller before reporting setup complete.

After the exact bootstrap revision is resolved, workflow resources must not be loaded from `main`, another branch, or a floating tag.

The implementation repository does **not** receive a copied `docs/implementation-workflow/` toolkit tree.

Before initialization, the installed caller's exact revision is the bootstrap identity. After `design-workflow init`, `.workflow/workflow-record.json` owns the canonical toolkit binding.

## 4. Start the workflow

Tell ChatGPT:

> **Start the implementation workflow.**

That remains the single normal workflow entry point.

Do not choose “designer mode,” “engineer mode,” Express/Lite/Standard/Full, or local/GitHub execution. Those are not human routing decisions.

## 5. What ChatGPT resolves

Before first initialization, the agent follows the pinned [`AGENTS-instructions.md`](AGENTS-instructions.md) and [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md) from the exact bootstrap revision.

It will:

1. inspect the configured Figma/design scope and implementation repository;
2. determine whether the design source needs material preparation before formal audit work;
3. classify the smallest valid workflow profile from actual complexity and risk under [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md);
4. determine whether the canonical CLI can run directly or must run through the installed GitHub remote executor;
5. initialize the explicit classified profile;
6. continue the canonical workflow until a human approval, consequential unresolved decision, or real capability blocker requires you.

The agent may tell you, for example:

> “This work qualifies for Lite because it is one static page with no persistence, authentication, shared application state, or architectural integration. I’ll initialize the workflow as Lite.”

That is a report of an evidence-based workflow decision, not a request for you to learn the profile taxonomy.

## 6. What is stored in the implementation repository

Before initialization, the normal remote-capable setup is intentionally small:

```text
.github/
└── workflows/
    └── design-workflow-command.yml
```

After initialization, the implementation project also owns its workflow state:

```text
.github/
└── workflows/
    └── design-workflow-command.yml

.workflow/
├── workflow-record.json
└── generated/
```

The workflow engine, prompts, guidelines, templates, source adapters, schemas, and CLI remain in the external toolkit repository. The implementation repository stores the transport pin and project-specific workflow state, not a duplicate copy of the toolkit.

## 7. Design preparation when needed

Figma preparation is not a separate user workflow route.

If the configured design scope materially needs normalization before a reliable developer handoff, agent orchestration can invoke the canonical [`source-adapters/FIGMA-PREPARATION.md`](source-adapters/FIGMA-PREPARATION.md) procedure when Figma editing is authorized.

Preparation remains outside `.workflow/` executable state and does not replace the formal Stage 1 design audit. If the source is already implementation-ready, the agent proceeds without unnecessary preparation.

If preparation is materially required but the agent lacks authorized write access to the source, it reports that actual blocker rather than selecting another workflow.

## 8. Human approvals remain human

The default safety posture for ChatGPT-driven work is Gated unless the project intentionally establishes another supported execution mode.

In Gated mode, ChatGPT may complete the current stage, perform the required review passes, and run canonical preflight, but it must stop for explicit human approval before recording a passing gate or advancing.

A GitHub Issue command, repository write permission, or agent confidence never counts as human approval.

## What the workflow does after initialization

The profile changes artifact granularity, not the process responsibility chain:

```text
Stage 0  source baseline + project context + control
   ↓
Stage 1  design audit
   ↓
Stage 2  requirements
   ↓
Stage 3  design intent
   ↓
Stage 4  specification
   ↓
Stage 5  consistency review
   ↓
Stage 6  architecture decision when applicable
   ↓
Stage 7  implementation plan
   ↓
Stage 8  adversarial plan review
   ↓
Stage 9  task decomposition
   ↓
Stage 10 implementation
   ↓
Stage 11 validation + final review
```

Express and Lite consolidate some narrative artifacts; Standard and Full separate more responsibilities. [`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md) owns the normative stage sequence, and [`workflow/Workflow-Profiles.md`](workflow/Workflow-Profiles.md) owns eligibility and upgrades.

## If GitHub remote execution is unavailable

The agent first attempts capability resolution; this is not a route the user should preselect.

Remote mutation is genuinely blocked when, for example:

- the caller cannot be committed to the default branch;
- repository or organization Actions policy blocks the pinned reusable workflow;
- required workflow permissions are denied;
- branch protection prevents the workflow token from writing where required.

In those cases the agent reports the specific blocker. It must never compensate by hand-editing `.workflow/workflow-record.json` or `.workflow/generated/*`.

See [`workflow/GitHub-Remote-Execution.md`](workflow/GitHub-Remote-Execution.md) for installation, command-envelope, authorization, concurrency, and failure semantics.

## Manual fallback: thin consumer bundle

The repository still provides a generated consumer bundle for environments where ChatGPT cannot install the caller directly through GitHub.

Build it from an exact toolkit revision with:

```bash
npm run build:consumer-bundle -- --revision <40-character-toolkit-commit-sha>
```

The generated bundle contains:

```text
consumer-bundle/
├── ChatGPT-Project-Instructions.md
├── consumer-bundle-manifest.json
└── repository/
    └── .github/
        └── workflows/
            └── design-workflow-command.yml
```

The bundle is deliberately thin. It does not vendor the workflow toolkit into the implementation repository. The generated caller is pinned to the exact revision supplied to the build command.

[`workflow/GitHub-Remote-Execution.md`](workflow/GitHub-Remote-Execution.md) owns the remote execution security and integrity contract.

## Advanced: direct CLI installation from GitHub

Engineers, automation systems, or local coding agents may install the same toolkit directly from GitHub at an exact revision:

```bash
npm install --save-dev github:ferfalcon/figma-to-implementation-workflow#<40-character-toolkit-commit-sha>
```

The package exposes the `design-workflow` executable, so a local environment can then run commands such as:

```bash
npx design-workflow agent-context --json
npx design-workflow stage check --json
npx design-workflow validate
npx design-workflow sync --check
```

This is an execution transport for environments that have Node.js and a package manager. It is not required for the normal ChatGPT + GitHub onboarding path and must not become a designer prerequisite.

## State ownership

CLI-managed execution has one canonical mutable state owner:

```text
.workflow/workflow-record.json
```

Generated files under `.workflow/generated/` are read-only projections. Agents and humans must not emulate CLI transitions by editing either the record or generated views manually.

When an agent can inspect GitHub but cannot run the CLI directly, `.workflow/generated/AGENT-CONTEXT.json` is the portable read-only routing projection for initialized projects. The agent verifies its record identity before trusting it and uses the installed GitHub transport for required canonical mutations.

See [`workflow/State-Ownership.md`](workflow/State-Ownership.md) and [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md).

## The setup test

A new consumer should be able to describe the setup as:

```text
Connect GitHub + Figma
      ↓
Paste Project Instructions
      ↓
Customize project values
      ↓
"Install the Design-to-Implementation Workflow"
      ↓
"Start the implementation workflow"
```

The first command prepares the repository transport; the second is the single workflow entry point.

If normal onboarding requires the user to understand commit SHAs, `expectedHead`, command envelopes, generated projection internals, profile taxonomy, local-versus-remote execution, or npm installation before they can start, the abstraction has leaked. Those details remain important, but they belong to the agent and engine layers.
