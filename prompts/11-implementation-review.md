# Stage 11 — Implementation Review

Verify the final input snapshots, approved artifacts, implementation-output repository snapshot, validation-runtime snapshot, and complete repository lineage.

Create or update `IMPLEMENTATION-REVIEW.md` from `templates/IMPLEMENTATION-REVIEW.template.md` and follow `workflow/Validation-Rules.md`.

Validate as applicable:

- source and lineage integrity;
- every must-have requirement and material specification;
- design fidelity against named `SRC-DS-*` snapshots;
- states, responsive behavior, content and asset edge cases;
- semantics, keyboard, focus, names, relationships, announcements, contrast, reflow, reduced motion, and screen-reader behavior;
- data, APIs, validation, errors, recovery, authentication, authorization, persistence, and migrations;
- compatibility, performance, security, privacy, SEO, deployment, rollback, tests, build, lint, type checking, and regressions.

Record `IMPL-*` findings with severity, source expectation, actual behavior, reproducible evidence, required correction, status, and retest evidence.

Do not report unavailable checks as passed. Corrected findings must be retested against the corrected output snapshot.

End with exactly one result:

- `Implementation accepted`
- `Implementation accepted with documented non-blocking deviations`
- `Implementation requires corrections`

Update `WORKFLOW-STATE.md` and report snapshots validated, checks executed, findings by severity, deviations, remaining risks, and recommended next action.
