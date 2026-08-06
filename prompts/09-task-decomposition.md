# Stage 9 — Task Decomposition

Verify the approved plan, plan review, architecture decision, repository snapshot, and workflow readiness.

For Standard and Full, create or update `TASKS-INDEX.md` from `templates/TASKS-INDEX.template.md` and one file per task from `templates/TASK.template.md`.

For Lite, use one task file when the work is one coherent result; create an index when multiple tasks or dependencies exist.

Each task must have:

- one independently verifiable objective;
- stable `P##-T##` identifier;
- task-start `SRC-REPO-*` snapshot;
- source, requirement, design, specification, architecture, and plan references;
- prerequisites and scope;
- existing and proposed files;
- ordered implementation steps without code;
- integrated accessibility, responsive, state, error, and testing work;
- validation and acceptance criteria;
- risks, discoveries, deviations, and Definition of Done.

Verify that every material plan item and must-have requirement is covered. Do not create unrelated cleanup tasks for concerns that belong with feature implementation.

Perform two reviews, update `WORKFLOW-STATE.md`, and report task count, dependency order, blockers, first unblocked task, and next permitted action.
