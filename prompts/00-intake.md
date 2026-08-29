# Stage 0 — Establish Source Baseline and Workflow Control

Establish the exact source and repository baseline before auditing, documenting, planning, or implementing.

Read/verify root `design-workflow.config.json` first. It owns stable project identity/boundaries; current tools/snapshots verify state. Do not copy stable values into narrative artifacts as a competing authority. Missing/materially conflicting configuration blocks Stage 0 until resolved.

## Profile targets

- Express: update `WORKPACK.md` source/scope/eligibility sections only.
- Lite, Standard, Full: update `SOURCE-BASELINE.md`, `PROJECT-CONTEXT.md`, and `WORKFLOW-STATE.md`.

Record exact design/repository scope, snapshot identity and limitations, source authority, quality expectations, constraints, selected profile/mode, and blockers. Pin repository state to a commit. Do not treat mutable URLs or branch names as immutable.

For Express, confirm all eligibility criteria before continuing. Do not create later-stage workpack content during Stage 0.

Perform two reviews: completeness/correctness, then consistency/source integrity/authority/risk after corrections. Verify active inputs and run stage preflight before proposing closure.
