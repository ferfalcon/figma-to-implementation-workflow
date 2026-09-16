# ChatGPT Product Experience

This contract owns the consumer experience for ordinary ChatGPT with existing plugins. It delegates executable state, stage legality, and source integrity to [Agent-Orchestration.md](Agent-Orchestration.md), implementation-environment resolution to [Implementation-Adapters.md](Implementation-Adapters.md), and provider-neutral runtime evidence to [Deployment-Adapters.md](Deployment-Adapters.md). It does not introduce another engine, a new execution mode, or persona-based profiles.

## Supported first result

The workflow produces frontend implementation work in the selected GitHub repository, a pull request, and verified implementation evidence appropriate to that repository. Deployment/runtime evidence is additional evidence when a provider is configured and relevant. It is required only when the approved project scope or acceptance contract explicitly requires a runtime.

Astro + TypeScript is the maintained implementation adapter for safely scaffoldable frontend roots and existing Astro + TypeScript applications. Existing applications using other implementation environments are preserved through the best-effort existing-framework adapter rather than being silently replaced with Astro. Adapter selection is an internal repository-resolution step, not a user workflow choice.

Static pages, navigation, accessible native interactions, responsive behavior, and design-system implementation are part of the maintained frontend scope. Persistence, authentication, server rendering, backend work, production publishing, framework migration, and other architecture-expanding work are supported only when explicitly in scope and must follow the normal architecture/profile rules.

All reasoning and code generation happen in ordinary ChatGPT. GitHub plugins write files; GitHub Actions or the repository's native CI provide remote execution and validation evidence when applicable; configured deployment providers may supply additional runtime evidence. Do not invoke Work, Codex, coding agents, or an API-backed generation service, including as a fallback. The product avoids those execution surfaces, not ordinary ChatGPT or provider usage.

A deployment is not a prerequisite for starting the conversation, establishing the project, resolving an implementation adapter, planning, implementing, or reporting successful repository/CI evidence. Resolve deployment capability when runtime evidence becomes relevant. If the approved result requires runtime evidence and that capability is unavailable, report that specific blocker. If runtime evidence is optional, keep the deployment limitation visible without converting successful implementation validation into failure.

## Progressive setup and capability checks

Follow the single human [QUICKSTART.md](../QUICKSTART.md). Begin from the repository locator in the ChatGPT Project instructions. Do not require the Figma design, review style, deployment provider, pre-generated application scaffolding, or every downstream capability before the first conversation. Existing project configuration and repository evidence should be reused before asking the human for anything already known.

Progressively establish the project in this order:

1. verify the intended implementation repository and read access;
2. read and preserve existing project configuration when present, otherwise inspect the repository and resolve required stable values from authoritative sources or explicit user intent;
3. inspect the configured/proposed implementation root and resolve the implementation adapter from repository evidence under [Implementation-Adapters.md](Implementation-Adapters.md); do not ask the human to choose an internal framework route when the evidence is sufficient;
4. verify Figma access when design inspection becomes necessary, and establish authorized edit scope before any design mutation;
5. ask once for review style before first workflow initialization when no saved choice exists;
6. verify repository write access, the canonical command bridge, and Actions only when their corresponding mutation, remote execution, or validation operation becomes necessary;
7. when runtime evidence becomes relevant, follow [Deployment-Adapters.md](Deployment-Adapters.md) to determine whether deployment is not configured, available, or blocked and load only the matching provider adapter;
8. create or update project configuration only after the required stable values have been resolved, and commit a complete valid configuration before first workflow initialization.

Browser authorization, provider connection, controlled Stage 10 scaffolding, and otherwise unavailable asset uploads are allowed when the corresponding operation becomes necessary. Resolving `astro-typescript` in `scaffold` mode does not authorize creating application files during intake; scaffolding remains approved implementation work.

Verify capabilities at the point of use:

| Capability | Verify when | Required evidence |
|---|---|---|
| GitHub read | Initial repository inspection | Successfully read the intended repository, its default branch, and existing project configuration or its confirmed absence. |
| GitHub write | At the first required repository mutation | A successful authorized commit or equivalent write on the intended repository/ref. Do not perform a dummy production mutation solely to prove access. |
| Figma read | Before design inspection | Successfully read the supplied/discovered file or frame, design context, and a screenshot; FigJam-only access is insufficient. |
| Figma edit | At the first authorized design-preparation mutation | A successful permitted edit and readback within configured/explicitly authorized scope. Read access alone does not prove edit permission. |
| Command bridge | At the first canonical CLI mutation when direct execution is unavailable | Create an authorized canonical request and read its terminal result; merely seeing an issue tool is insufficient. |
| Actions / native CI evidence | Before relying on remote command or automated validation evidence | Read the relevant workflow run, job logs, or equivalent provider evidence for the intended repository and commit. |
| Deployment/runtime inspection | Only when runtime evidence is configured or explicitly required | Inspect the matching provider project/deployment, exact implementation commit, normalized ready state, and resulting HTTPS runtime URL. |

Use real required operations as evidence, not dummy production mutations. Before an operation is needed, mark it available-but-unverified rather than passed. A plugin listing in Codex does not prove availability in ordinary ChatGPT. The owner's successful normal-chat tests establish initial feasibility only, not universal account compatibility.

Keep a concise capability table with evidence links in the current profile's owning context/workpack. These are observations, not permission grants or executable state. A missing capability blocks only work that actually depends on it: report the specific provider/account/permission requirement and pause the affected operation without pretending unrelated setup failed. Do not silently change products, assume broader access, or claim a browser/manual step ran.

## Configuration and resuming

Read default-branch configuration first, then the saved working branch for configuration v2 or v3. Verify repository identity, branch existence, and derived configuration-revision consistency before reading that branch's record/projection. Do not fall back to default-branch workflow state when the saved branch is missing or inaccessible.

On first setup, start from the repository locator and reuse authoritative repository/configuration evidence before asking for missing context. When configuration is absent, resolve required values progressively in conversation; do not commit a partially filled configuration. Ask once for review style before initialization when it is not already saved, recommend **Brief and final review**, and persist the user's actual choice in configuration v3. Create the complete valid configuration on the default branch before initializing the feature branch. Preserve an existing valid caller. Create the working branch from the resulting setup commit, then initialize there with fresh HEAD. Never reuse an unrelated existing branch silently.

When configuration v2 is encountered, preserve its repository identity and saved working branch, normalize legacy `brief-and-preview` to the current `brief-and-final` behavior, and migrate the stored configuration deterministically to v3. When configuration v1 is encountered, preserve the established ref and execution mode until the human explicitly adopts the working branch and review style required for v3; neither value may be guessed. A configuration change after planning is subject to the ordinary lineage/impact checks. Updates to stable configuration must be committed canonically on the default branch and deliberately mirrored to the working branch before further substantive work; compare derived configuration revisions before trusting workflow state there.

Implementation-adapter selection is not stored in project configuration. Re-resolve it from the configured implementation root and current repository evidence when material repository changes could invalidate the earlier observation, and record the observation against the relevant repository snapshot in Stage 0/planning artifacts.

Configuration v3 deployment identity may remain unconfigured with `deployment.provider: null` and `deployment.projectUrl: null`; `deployment.productionUrl` may also be null. That does not block repository setup, workflow planning, implementation, or implementation-evidence reporting. If approved scope later requires runtime evidence, resolve the deployment capability then and report a precise blocker if it cannot be established.

A new chat reloads the saved branch, toolkit pin, and freshness-verified generated context. Resume in-progress tasks and pending review decisions; do not repeat installation or infer approvals from conversation summaries.

## Review preferences

The preference controls human checkpoints, not profile selection, implementation-adapter selection, deployment availability, or evidence requirements.

### Brief and final review

The human-facing **Brief and final review** label maps to configuration v3 value `brief-and-final`. Configuration v2's legacy `brief-and-preview` value is treated as the same behavior while it is being migrated and is not emitted by current configuration.

Initialize with Continuous documentation. Continue through audit, documentation, required architecture, reviews, and Stage 9 while no consequential decision is unresolved. Agent-permitted internal artifact approvals must identify the agent honestly; they are not human approvals.

Present a concise implementation brief describing the selected pages, implementation adapter/environment, responsive behavior, interactions, assets, exclusions, assumptions, and acceptance checks. Link the reviewed artifacts and list the approved task scope. Ask the human to approve implementation of that complete scope.

Only after explicit approval, record its actor, scope, artifact versions, and evidence in the owning narrative. Use the canonical mode command to switch to Task-by-task at Stage 9, rerun preflight/review because mode changes invalidate the current gate, and enter Stage 10. Execute the approved tasks sequentially with normal task start, source verification, validation, commit, and completion. The scoped approval explicitly permits continuing to the next approved task; it does not authorize unrelated tasks, framework migrations, or design changes.

Material scope changes, unexpected source changes, adapter-invalidating repository changes, and consequential ambiguity stop affected work for impact assessment and renewed approval. At Stage 11, present the exact implementation commit and actual validation evidence. Add matching runtime evidence when it is available; if runtime evidence is required but blocked, stop the runtime-dependent acceptance claim. When deployment is not configured or required, state that runtime evidence is not applicable rather than claiming a preview was inspected. Obtain explicit human final acceptance and never infer an approval actor.

### Every stage

Use the existing Gated mode. Present the current stage result and obtain explicit human approval before its passing decision and advancement. Preserve required task and final acceptance checks.

The selected style is fixed for the active run unless the human explicitly requests a change. Assess and persist such a change before altering the canonical mode; never reinterpret earlier agent reviews as human approvals. Native plugin approval prompts remain governed by the platform.

## Implementation and durable assets

Resolve the implementation environment through [Implementation-Adapters.md](Implementation-Adapters.md) and load only the matching adapter guidance. The adapter owns framework-specific implementation constraints; the canonical workflow continues to own scope, approvals, tasks, source integrity, and completion.

For a safely scaffoldable root with no conflicting approved requirement, the maintained Astro + TypeScript adapter is the default. For an existing application outside the maintained adapter, preserve that framework and use its native repository conventions on a best-effort basis. Never overwrite an unfamiliar non-empty application root or migrate frameworks merely to reach the maintained path.

Save required images, icons, and fonts inside the implementation repository with meaningful names. Reuse existing project assets first. Transfer export bytes through available plugin capabilities; if an asset cannot be transferred, request a browser upload when that asset becomes necessary and verify its committed path. Never use expiring Figma export URLs or localhost asset-server URLs as runtime dependencies. Do not invent a successful asset transfer or substitute an unapproved placeholder.

Keep Figma inspection separate from design mutation. Material preparation is allowed only within explicitly authorized editing scope under [FIGMA-PREPARATION.md](../source-adapters/FIGMA-PREPARATION.md). Design ambiguity may require clarification; a code-generation request alone does not authorize destructive source cleanup.

## Remote validation and deployment evidence

Apply [Validation-Rules.md](Validation-Rules.md) plus the selected implementation adapter. Validation must reflect the actual repository, commands, changed scope, and tested commit rather than imposing Astro-shaped checks on unrelated frameworks.

For the maintained Astro + TypeScript adapter, use the maintained Astro baseline in [`../implementation-adapters/ASTRO.md`](../implementation-adapters/ASTRO.md): deterministic install, Astro/type checks, production build, browser setup when required, and browser/end-to-end coverage. For existing-framework work, inspect and run the repository's native applicable checks under [`../implementation-adapters/EXISTING-FRAMEWORK.md`](../implementation-adapters/EXISTING-FRAMEWORK.md). Missing, skipped, cancelled, stale, blocked, or failing required checks block the corresponding implementation-readiness claim.

Read automated validation evidence through the connected provider. When the maintained validation workflow emits a machine-readable `VALIDATION_RESULT`, use it for check names, outcomes, repository, and tested commit. Other repositories may expose equivalent native CI evidence; record exactly what was actually inspected. Do not translate workflow bookkeeping validation into application validation.

After implementation evidence is established, handle runtime evidence independently under [Deployment-Adapters.md](Deployment-Adapters.md):

- no configured or required deployment: record runtime evidence as not applicable;
- deployment available: load the provider adapter, inspect a runtime tied to the exact tested implementation commit, and bind it as a Validation runtime snapshot when used;
- deployment configured but blocked: report the deployment limitation without erasing successful implementation evidence;
- runtime explicitly required by approved scope: keep final runtime-dependent acceptance blocked until valid deployment evidence exists or the requirement is explicitly changed.

A moving alias that resolves to another commit is not evidence. Later workflow-only bookkeeping commits do not change which implementation commit was tested. A replacement implementation commit requires fresh implementation validation and fresh deployment evidence whenever runtime evidence is required.

The remote CLI bridge uses `GITHUB_TOKEN`; its bookkeeping pushes do not normally trigger another Actions run. Application checks run from the ordinary implementation push or the repository's native CI trigger. Do not rely on a bookkeeping push to start application checks, and do not widen the command bridge into arbitrary shell execution.

Before final acceptance, distinguish automated checks, any actually inspected screenshots/runtime behavior, deployment evidence when available, and human acceptance. Provide the PR, implementation commit, actual checks, runtime evidence when applicable, and deviations. A provider-ready deployment alone does not establish functional or visual correctness. Final acceptance does not merge the PR or promote production.

## Failures and corrections

For failed builds or checks, inspect the exact failing evidence, fix only affected approved work, commit, and rerun required checks for the replacement commit. For stale command HEAD or projections, refresh authoritative state and follow canonical recovery; never hand-edit the record.

When the human requests a correction, follow the existing stage rewind, artifact reopening, snapshot supersession, and task mechanisms. Reassess the scope and implementation adapter; upgrade the profile if necessary, including a second independent task in Express. Retest the corrected output and request final acceptance again. Old implementation, deployment, and approval evidence remain historical, not proof of the new output.

## Product acceptance

Use [Product-Acceptance.md](Product-Acceptance.md) for ordinary personal ChatGPT acceptance sessions and maintainer QA evidence. Current acceptance deliberately exercises both a no-deployment path and a deployment-required path. Product acceptance is not a distribution or release gate. Synthetic fixtures and repository CI do not substitute for real-user acceptance evidence. Maintainer acceptance may explicitly qualify the maintained Astro adapter without implying that every best-effort framework has equivalent maintained coverage.
