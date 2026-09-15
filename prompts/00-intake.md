# Stage 0 — Establish Source Baseline and Workflow Control

Establish the exact source and repository baseline before auditing, documenting, planning, or implementing.

Read/verify root `design-workflow.config.json` first. It owns stable project identity/boundaries; current tools/snapshots verify state. Do not copy stable values into narrative artifacts as a competing authority. Missing/materially conflicting configuration blocks Stage 0 until resolved.

Resolve the implementation environment from the configured `repository.implementationRoot` and active repository snapshot under [`../workflow/Implementation-Adapters.md`](../workflow/Implementation-Adapters.md). Record the observed adapter, mode (`scaffold` or `adapt`), support level, evidence, and constraints in the Stage 0 narrative owner. Adapter selection is repository evidence, not project configuration or executable workflow state. A scaffoldable Astro resolution does not authorize application scaffolding before approved Stage 10 implementation work.

## Profile targets

- Express: update `WORKPACK.md` source/scope/eligibility sections only.
- Lite, Standard, Full: update `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, and `WORKFLOW-STATE.md`.

Record exact design/repository scope, snapshot identity and limitations, implementation capability, source authority, quality expectations, constraints, selected profile/mode, and blockers. Pin repository state to a commit. Do not treat mutable URLs or branch names as immutable.

For Express, confirm all eligibility criteria before continuing. Do not create later-stage workpack content during Stage 0.

Perform two reviews: completeness/correctness, then consistency/source integrity/authority/risk after corrections. Verify active inputs and run stage preflight before proposing closure.
