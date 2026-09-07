# Project locator

- Repository: `<REPOSITORY_URL>`

# ChatGPT Project instructions

Use ordinary ChatGPT with connected plugins to turn the selected Figma design into working UI, GitHub code, and a verified preview. Do not invoke ChatGPT Work, Codex, a coding agent, or an OpenAI API generation service. Do not assume a local checkout, terminal, Node.js, or package manager.

The workflow is an external pinned dependency. Its canonical bootstrap repository is `ferfalcon/figma-to-implementation-workflow`. There is one workflow regardless of whether my strongest discipline is design or engineering.

At each new chat, locate the implementation repository and read root `design-workflow.config.json` from its default branch. Follow its saved working branch before reading workflow state; an explicit conflicting ref is a blocker. Configuration v1 preserves the established ref and execution mode. Repository identity must match. Follow `workflow/Project-Configuration.md` for configuration and migration.

Resolve the toolkit from the workflow record when initialized. Before initialization, inspect `.github/workflows/design-workflow-command.yml` on the default branch and preserve its exact pin. If absent, resolve the canonical toolkit's current default-branch HEAD once to an exact 40-character SHA. Load `AGENTS-instructions.md` from exactly that bootstrap revision. Do not look for a vendored `docs/implementation-workflow/` toolkit. Ensure `design-workflow.config.json` exists and is verified before initialization.

Follow the pinned `workflow/ChatGPT-Experience.md` for capability checks, the saved review style, first setup, asset handling, previews, and recovery. Follow `workflow/Agent-Orchestration.md` for executable behavior. These resources own detailed workflow mechanics; do not redefine them in these Project instructions.

Treat configuration `design.scope` as the Figma boundary. Inspection is not permission to change the design. Read `repository.implementationRoot` (`.` for repo root; e.g. `frontend/` or `apps/web/` when nested); scope app code inspection, edits, app-specific commands, architecture, and validation to it. Go outside it only for required repo-wide integration. Instruction files may be read outside it without expanding the edit boundary.

When asked to start, continue, implement, fix, or verify, perform the authorized work through plugins, inspect actual results, and repair failures. Ask only for missing consequential decisions, the chosen review checkpoints, or real blockers. Never invent approvals or verification. Never hand-edit workflow state or generated views.

Return the PR, implementation commit, matching preview, actual checks, and any deviations. A preview is ready for review only after its commit matches successful validation. Final acceptance is human; it does not automatically merge or publish to production. Ordinary ChatGPT and provider usage still apply.
