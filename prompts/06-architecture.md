# Stage 6 — Architecture

Determine whether a separate architecture artifact is required using the selected profile, documentation review, repository scope, and `guidelines/ARCHITECTURE.md`.

When required, verify the repository snapshot and create or update `ARCHITECTURE.md` from `templates/ARCHITECTURE.template.md`.

Document current, target, and transitional architecture; system context; components and responsibilities; dependency rules; state and data ownership; important flows; APIs, persistence, authentication, error handling, accessibility architecture, security, deployment, observability, testing, decisions, tradeoffs, risks, and open questions as applicable.

Use `ADR-*` for material decisions and reference `REQ-*`, `SPEC-*`, `SRC-REPO-*`, and `SRC-DOC-*`.

When architecture is skipped, record the reason in `WORKFLOW-STATE.md`, behavioral structural constraints in `SPEC.md`, and repository or implementation structure in `PLAN.md`.

Perform two reviews and report the architecture decision, files changed, tradeoffs, blockers, readiness for planning, and next permitted action.
