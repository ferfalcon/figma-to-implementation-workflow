# Stage 5 — Documentation Review

Verify source snapshots and review the pinned design source, `DESIGN-AUDIT.md`, `REQUIREMENTS.md`, `DESIGN.md`, and `SPEC.md`.

For Standard and Full, correct findings in the artifact that owns each decision and create or update `DOCUMENT-REVIEW.md` from `templates/DOCUMENT-REVIEW.template.md`.

For Lite, perform both review passes inside `IMPLEMENTATION-BRIEF.md`.

Check source metadata, authority, contradictions, missing coverage, unsupported behavior, untestable language, responsive and accessibility gaps, missing states, unclear data ownership, assumptions presented as facts, and broken traceability.

Pass 1 checks completeness and correctness. Apply corrections before Pass 2, which checks consistency, traceability, source integrity, risks, and uncertainty.

End with exactly one readiness status:

- `Ready for architecture and planning`
- `Ready with documented non-blocking assumptions`
- `Blocked by unresolved decisions`

Update `WORKFLOW-STATE.md` and report findings, corrections, remaining risks, blockers, and next permitted action.
