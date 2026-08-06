# Stage 10 — Implement One Task

Select the first incomplete task whose prerequisites are satisfied. Implement only that task's scope.

Before editing:

1. verify active design and documentation inputs;
2. verify the task-start `SRC-REPO-*` commit;
3. inspect affected files and repository conventions;
4. classify differences as Unchanged, Expected output, Unexpected upstream or concurrent change, or Unavailable.

Stop and perform impact assessment for an unexpected material change. Do not reopen upstream stages for an approved previous-task output.

Implement the task in small, reviewable changes. Integrate required semantics, keyboard and focus behavior, responsive behavior, states, errors, content edges, and tests with the affected feature.

Run every required validation. Do not mark the task complete while a required check fails or remains unverified.

After successful implementation:

- commit the approved result;
- create an Implementation output `SRC-REPO-*` record;
- connect it to the task-start snapshot and task ID;
- update the task, index, source baseline, documentation discoveries, deviations, and workflow state;
- identify the next unblocked task.

Report files changed, behavior, validation executed and results, output snapshot, deviations, remaining risks, documentation updates, and next permitted action.
