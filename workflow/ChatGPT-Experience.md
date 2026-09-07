# ChatGPT Product Experience

This contract owns the consumer experience for ordinary ChatGPT with existing plugins. It delegates executable state, stage legality, and source integrity to [Agent-Orchestration.md](Agent-Orchestration.md). It does not introduce another engine, a new execution mode, or persona-based profiles.

## Supported first result

New Astro + TypeScript projects produce a GitHub pull request and a working Vercel preview of the selected frontend scope. Static pages, navigation, and native browser interactions are supported. Persistence, authentication, server rendering, production publishing, and arbitrary existing-framework adaptation are outside the maintained starter path. Neon is optional for later explicitly scoped work.

All reasoning and code generation happen in ordinary ChatGPT. GitHub plugins write files; GitHub Actions run the canonical CLI and consumer checks; Vercel's Git integration builds previews. Do not invoke Work, Codex, coding agents, or an API-backed generation service, including as a fallback. The product avoids those execution surfaces, not ordinary ChatGPT or provider usage.

## One-time setup and capability checks

Follow the single human [QUICKSTART.md](../QUICKSTART.md). The generated starter contains application scaffolding and a thin pinned caller, not a vendored toolkit. Browser authorization, template creation, Vercel import, and otherwise unavailable asset uploads are allowed during setup.

Before substantive work, inspect the actual connected capabilities:

| Capability | Required evidence |
|---|---|
| Figma Design | Successfully read the supplied file/frame, design context, and a screenshot; FigJam-only access is insufficient. |
| GitHub reads and writes | Read the repository and verify an authorized setup/configuration commit on the intended repository. |
| Command issues | Create an authorized canonical request and read its terminal result; merely seeing an issue tool is insufficient. |
| Actions | Read a workflow run and its job logs for the intended repository and commit. |
| Preview | Inspect the connected Vercel project, deployment status/commit, and the resulting URL. |

Use real setup operations as evidence, not dummy production mutations. Before an operation is needed, mark it available-but-unverified rather than passed. A plugin listing in Codex does not prove availability in ordinary ChatGPT. The owner's successful normal-chat tests establish initial feasibility only, not universal account compatibility.

Keep a concise capability table with evidence links in the current profile's owning context/workpack. These are observations, not permission grants or executable state. If a capability fails, report the specific provider/account/permission requirement and pause affected work. Do not silently change products, assume broader access, or claim a browser/manual step ran.

## Configuration and resuming

Read default-branch configuration first, then the saved working branch in v2. Verify repository identity, branch existence, and configuration consistency before reading that branch's record/projection. Do not fall back to default-branch workflow state when the saved branch is missing or inaccessible.

On first setup, ask once for review style, recommend Brief and final preview, and persist the user's actual choice. Create configuration on the default branch before initializing the feature branch. Preserve an existing valid caller. Create the working branch from the resulting setup commit, then initialize there with fresh HEAD. Never reuse an unrelated existing branch silently.

Version 1 configurations retain the established ref and mode until the user chooses adoption. Version 2 adoption adds the chosen reviewStyle and the existing working branch; it must not move work or silently switch an active mode. A configuration change after planning is subject to the ordinary lineage/impact checks. Updates to stable configuration must agree on the default and working branches before further work.

A new chat reloads the saved branch, toolkit pin, and freshness-verified generated context. Resume in-progress tasks and pending review decisions; do not repeat installation or infer approvals from conversation summaries.

## Review preferences

The preference controls human checkpoints, not profile selection or evidence requirements.

### Brief and final preview

Initialize with Continuous documentation. Continue through audit, documentation, required architecture, reviews, and Stage 9 while no consequential decision is unresolved. Agent-permitted internal artifact approvals must identify the agent honestly; they are not human approvals.

Present a concise implementation brief describing the selected pages, responsive behavior, interactions, assets, exclusions, assumptions, and acceptance checks. Link the reviewed artifacts and list the approved task scope. Ask the human to approve implementation of that complete scope.

Only after explicit approval, record its actor, scope, artifact versions, and evidence in the owning narrative. Use the canonical mode command to switch to Task-by-task at Stage 9, rerun preflight/review because mode changes invalidate the current gate, and enter Stage 10. Execute the approved tasks sequentially with normal task start, source verification, validation, commit, and completion. The scoped approval explicitly permits continuing to the next approved task; it does not authorize unrelated tasks or design changes.

Material scope changes, unexpected source changes, and consequential ambiguity stop affected work for impact assessment and renewed approval. At Stage 11, show the matching preview and evidence, and obtain explicit human final acceptance. Never infer an approval actor.

### Every stage

Use the existing Gated mode. Present the current stage result and obtain explicit human approval before its passing decision and advancement. Preserve required task and final acceptance checks.

The selected style is fixed for the active run unless the human explicitly requests a change. Assess and persist such a change before altering the canonical mode; never reinterpret earlier agent reviews as human approvals. Native plugin approval prompts remain governed by the platform.

## Implementation and durable assets

Adapt Figma reference code into Astro components, TypeScript, shared CSS variables, and native browser interactions. Do not introduce React, Tailwind, a backend, or a new dependency just because the design-context reference uses it.

Save required images, icons, and fonts inside the implementation repository with meaningful names. Reuse existing project assets first. Transfer export bytes through available plugin capabilities; if an asset cannot be transferred, request a browser upload during setup and verify its committed path. Never use expiring Figma export URLs or localhost asset-server URLs as runtime dependencies. Do not invent a successful asset transfer or substitute an unapproved placeholder.

Keep Figma inspection separate from design mutation. Material preparation is allowed only within explicitly authorized editing scope under [FIGMA-PREPARATION.md](../source-adapters/FIGMA-PREPARATION.md). Design ambiguity may require clarification; a code-generation request alone does not authorize destructive source cleanup.

## Remote validation and preview

The starter's Validate UI workflow checks out the exact pushed commit or PR head commit, installs from the lockfile, runs astro check, builds production output, and runs Playwright against that output. Tests cover actual project behavior, keyboard interaction, responsive layout, assets, and accessibility. Extend the starter smoke tests to the approved requirements as the UI changes.

Read the workflow run and job logs through GitHub. Use the machine-readable VALIDATION_RESULT log entry and artifact for check names, outcomes, repository, and tested commit. Missing, skipped, cancelled, stale, or failing required checks block readiness. Do not translate workflow bookkeeping validation into application validation.

Wait for a READY Vercel deployment whose git commit equals the tested implementation commit. Inspect the URL with the available provider tool and report that URL. An alias that moved to another commit is not evidence. Bind this deployment as the Validation runtime snapshot and use the ordinary task validation/output mechanisms. Later bookkeeping commits do not change which implementation commit was tested.

The remote CLI bridge uses GITHUB_TOKEN; its bookkeeping pushes do not normally trigger another Actions run. Application checks run from the ordinary plugin-authored implementation push. Do not rely on a bookkeeping push to start UI checks, and do not widen the command bridge into arbitrary shell execution.

Before final acceptance, distinguish automated checks, any actually inspected screenshots, and the human visual review. Provide a PR, commit, preview, concise checks, and deviations. A READY deployment alone does not establish functional or visual correctness. Final acceptance does not merge the PR or promote production.

## Failures and corrections

For failed builds, inspect the exact failing job, fix only affected approved work, commit, and rerun required checks for the replacement commit. For stale command HEAD or projections, refresh authoritative state and follow canonical recovery; never hand-edit the record.

When the human requests a correction, follow the existing stage rewind, artifact reopening, snapshot supersession, and task mechanisms. Reassess the scope; upgrade the profile if necessary, including a second independent task in Express. Retest the corrected output and request final acceptance again. Old evidence and approvals remain historical, not proof of the new output.

## Acceptance and release

Use [Product-Acceptance.md](Product-Acceptance.md) for ordinary personal ChatGPT acceptance sessions and publication evidence. Synthetic fixtures and repository CI do not substitute for two real testers or a verified external preview.
