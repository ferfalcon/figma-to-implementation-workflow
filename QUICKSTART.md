# Quickstart: Start the Implementation Workflow

Use ordinary ChatGPT with connected plugins to turn a Figma design into working frontend code, a GitHub pull request, and verified implementation evidence. You can get started without a local development environment.

The only project information you need to configure before the first chat is the repository URL. Figma context, review style, deployment details, implementation environment, and other required information are established progressively when they become relevant.

## 1. Create a ChatGPT Project

Choose the GitHub repository that will own the implementation.

Create a ChatGPT Project, copy [`Project-settings--Instructions.md`](Project-settings--Instructions.md) into the Project Instructions, and replace only:

```text
<REPOSITORY_URL>
```

with the repository URL.

That repository locator is the bootstrap pointer for future chats. Stable project context belongs in `design-workflow.config.json`; you do not need to prepare or edit that JSON manually before starting.

You do not need to clone the repository, open a terminal, install Node.js, prepare application scaffolding, choose a framework adapter, configure deployment, or provide a Figma link before the first conversation.

## 2. Start the workflow

Start a new chat in the Project and say:

> **Start the implementation workflow.**

That is the single user-facing workflow entry point.

You do **not** need to choose a workflow profile, implementation adapter, source adapter, deployment adapter, or execution transport. ChatGPT resolves those internal choices from the actual sources, project configuration, repository evidence, workflow state, and available capabilities.

## 3. Let ChatGPT establish the project

ChatGPT starts from the repository locator and progressively establishes the context required to initialize the workflow safely.

It will:

- verify access to the implementation repository;
- read and preserve `design-workflow.config.json` when it already exists;
- migrate a valid configuration v2 deterministically to v3 before treating it as the current writable format;
- require explicit working-branch and review-style adoption before migrating configuration v1;
- classify the actual design/reference source and load only the matching source adapter when source-specific guidance is needed;
- inspect the configured/proposed implementation root and resolve the implementation adapter from repository evidence;
- use the maintained Astro + TypeScript adapter for a safely scaffoldable root or existing Astro + TypeScript application;
- preserve other existing frameworks through the best-effort existing-framework adapter instead of replacing them with Astro;
- inspect the repository and infer other non-consequential values when safe;
- discover or ask for the Figma design when design inspection becomes necessary;
- establish the authorized Figma scope before any design mutation;
- ask for your review style once before workflow initialization when it has not already been saved;
- discover deployment information only when runtime evidence becomes relevant;
- resolve direct CLI execution first and use an authorized remote execution transport only when direct execution is unavailable;
- install or verify the pinned GitHub remote workflow caller when that transport is required and no direct execution path is available;
- create and commit a complete, valid project configuration before first workflow initialization when configuration does not already exist.

Source- and implementation-adapter resolution are internal observations, not extra choices you need to configure. ChatGPT records material environment/source evidence in the workflow's narrative context and asks only for consequential boundaries or technical decisions it cannot infer safely.

Resolving the maintained Astro adapter for a new project does **not** mean scaffolding happens during setup. Application scaffolding remains approved implementation work and occurs only after the normal planning/review gates in Stage 10.

During first setup, ChatGPT reads or creates `design-workflow.config.json`. Creation happens only after the required values have been resolved, so the committed configuration is complete and valid rather than a partially filled setup file.

ChatGPT asks only for missing required information, missing required capabilities, consequential decisions, or real blockers. It does not ask you to choose internal workflow mechanics that it can determine itself.

### Capabilities are connected when needed

You do not need to connect every provider before starting.

- **GitHub for the implementation repository** is required to inspect the repository and perform repository work. If access is missing, ChatGPT asks you to connect it.
- **Figma for design inspection and authorized design changes** becomes required when the workflow needs to inspect the design or perform an approved design-preparation change.
- **A deployment provider** is optional unless the approved project scope explicitly requires runtime evidence. When deployment is configured or relevant, ChatGPT follows the deployment adapter and verifies that any runtime evidence belongs to the tested implementation commit.
- **An execution transport** is resolved only when canonical CLI execution is required. Direct CLI execution is preferred when available; otherwise ChatGPT uses a supported authorized remote transport or reports the specific capability blocker.

Native provider permission prompts still follow your account settings.

## 4. Provide information progressively

The workflow distinguishes between information that must eventually exist and information that must exist before the first conversation.

| Information | When it becomes necessary | What happens |
|---|---|---|
| Repository URL | Before the first chat | You set it once in the Project Instructions. |
| Implementation environment | During repository inspection | ChatGPT resolves it from `repository.implementationRoot` and repository evidence; it asks only if the boundary is genuinely ambiguous. |
| Figma design | Before design inspection | ChatGPT discovers it from authoritative project context or asks you for it. |
| Figma scope | Before an authorized design mutation | ChatGPT preserves existing scope or asks when edit authority is ambiguous. |
| Review style | Before first workflow initialization | ChatGPT asks once if no saved choice exists. |
| Deployment | When runtime evidence is relevant | ChatGPT resolves it as not configured, available, or blocked. No configured deployment does not invalidate successful repository/CI evidence. |
| Assets or product decisions | When the implementation genuinely depends on them | ChatGPT asks only for what cannot be transferred or inferred safely. |

When ChatGPT asks for review style, choose one of the existing product behaviors:

| Style | Your involvement |
|---|---|
| Brief and final review | Approve the implementation brief, then review the finished evidence/result. |
| Every stage | Review and explicitly approve each workflow stage. |

Configuration v3 stores the first option as `brief-and-final`. Configuration v2 remains readable with the legacy `brief-and-preview` identifier and migrates it deterministically to `brief-and-final`. Both styles preserve final human acceptance. Material scope changes can require another decision.

Figma preparation is not a separate user workflow route. When preparation is required, it remains part of the same implementation workflow and any design mutation stays inside the authorized Figma scope.

## 5. Review the implementation

After the required planning and approval gates, ChatGPT performs the authorized implementation work through the available execution transport and selected implementation adapter, then inspects the actual results.

It returns the available evidence, including:

- the GitHub pull request;
- the implementation commit;
- automated verification results actually produced by the project;
- matching deployment/runtime evidence when configured and available;
- a clear `Not applicable` runtime status when no deployment is configured or required;
- remaining deviations or blockers that still require human attention.

Review the implementation against the Figma design and ask for corrections or accept the result. If the approved scope requires a runtime and deployment is blocked, that runtime-dependent acceptance claim remains blocked. Final acceptance remains human and does not automatically merge the pull request or publish to production.

If a plugin, build, asset, capability, transport, or deployment is unavailable, ChatGPT reports that specific limitation rather than claiming success.

## 6. Continue later

The repository owns the durable project configuration and workflow state, so a later conversation in the same ChatGPT Project can say:

> **Continue the implementation workflow.**

or, when a runtime exists:

> **Show the current preview.**

ChatGPT reads the saved project configuration, follows the established working branch, reuses current source/repository evidence and adapter observations when still valid, and resumes from repository-owned state instead of asking you to reconstruct the workflow from conversation memory.

## Existing projects and advanced reference

“Install the Design-to-Implementation Workflow in this repository” remains a setup action, not a second workflow route. Existing configuration v2 migrates deterministically to v3. Existing configuration v1 retains its established ref and execution mode until you explicitly adopt the working branch and review style required by v3.

Installation, immutable toolkit pins, the canonical CLI, and transport selection are owned by [Execution Transports](workflow/Execution-Transports.md) and [Agent Orchestration](workflow/Agent-Orchestration.md). The current GitHub remote provider is documented in [GitHub Remote Execution](workflow/GitHub-Remote-Execution.md). [Project Configuration](workflow/Project-Configuration.md) owns current v3 configuration, deterministic v2 migration, and explicit v1 adoption. [Source Adapters](workflow/Source-Adapters.md) owns source-format classification/delegation. [Implementation Adapters](workflow/Implementation-Adapters.md) owns implementation-environment resolution and maintained/best-effort adapter behavior. [Deployment Adapters](workflow/Deployment-Adapters.md) owns optional runtime-evidence behavior and provider-specific delegation.

Markdown-only is a manual/scaffold mode without executable workflow state, generated routing, or agent orchestration. The ChatGPT product uses CLI-managed state.

### Manual fallback: thin consumer bundle

Maintainers can still generate the thin caller and canonical Project Instructions for an existing repository. It does not include application scaffolding or vendor the toolkit. See the [CLI reference](cli/README.md) for direct installation and bundle generation.

Detailed agent behavior for capability checks, review styles, assets, recovery, and deployment evidence is owned by [ChatGPT Experience](workflow/ChatGPT-Experience.md).
