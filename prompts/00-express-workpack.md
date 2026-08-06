# Express Profile — Create and Execute One Workpack

Use the Express profile only for one narrow, coherent implementation result that can be represented, implemented, and validated in a single `WORKPACK.md`.

Start from [`../templates/WORKPACK.template.md`](../templates/WORKPACK.template.md). Do not create separate source-baseline, context, workflow-state, audit, requirements, design, specification, plan, task, or implementation-review Markdown artifacts while the work remains eligible for Express.

## Eligibility gate

Confirm all of the following before continuing:

- one clearly bounded design-source scope or source bundle;
- one coherent implementation result;
- at most one implementation task;
- no persistence, authentication, authorization, or external API work;
- no meaningful routing, shared-state, migration, deployment, security, privacy, or rollback decision;
- no unresolved product decision that materially changes the expected result;
- no multi-contributor coordination requiring separate task ownership;
- independent validation is possible without reconstructing a broader feature.

If a condition is false or becomes false, stop affected work and upgrade to Lite, Standard, or Full. Preserve stable IDs and source records when splitting the workpack.

## Workpack sequence

1. Record control state and Express eligibility.
2. Define source snapshots, scope, authority, limitations, and repository commit baseline.
3. Inspect the actual design and repository scope.
4. Record evidence and findings with `EVD-*` and `AUD-*` IDs.
5. Define requirements, design intent, specification, and acceptance criteria in separate ownership sections using their normal IDs.
6. Create one repository-aware implementation approach and one task, normally `P01-T01`.
7. Perform two review passes:
   - completeness and correctness;
   - consistency, traceability, source integrity, risks, and upgrade triggers after corrections.
8. Implement only when the selected execution mode permits it and readiness is not blocked.
9. Commit the approved result and record an Implementation output `SRC-REPO-*` snapshot linked to the task-start snapshot and task ID.
10. Execute required validation and record evidence honestly.
11. Complete the final implementation review inside the workpack.

## Operating rules

- Inspect actual sources rather than relying on summaries.
- A mutable Figma URL, website, branch, or shared document is not an immutable snapshot.
- Do not silently use newer content under an older source ID.
- Do not invent product behavior, responsive rules, breakpoints, focus behavior, APIs, dependencies, paths, commands, or thresholds.
- Integrate accessibility, responsive behavior, states, errors, and tests into the implementation work.
- A passed validation check requires evidence. Failed, blocked, unexecuted, or not-applicable checks require a reason.
- Corrected findings require retesting.
- A second independent implementation task is an automatic upgrade trigger.

## Completion report

Report:

- workpack status and profile eligibility;
- exact input snapshots;
- files changed;
- behavior implemented;
- validation executed and results;
- task-start and implementation-output snapshots;
- deviations and remaining risks;
- final acceptance result;
- next permitted action.
