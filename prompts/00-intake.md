# Stage 0 — Project Intake

Use [`../workflow/Design-Implementation-Workflow.md`](../workflow/Design-Implementation-Workflow.md), [`../workflow/Workflow-Profiles.md`](../workflow/Workflow-Profiles.md), [`../workflow/Source-Snapshots.md`](../workflow/Source-Snapshots.md), [`../workflow/Source-Authority.md`](../workflow/Source-Authority.md), and the relevant guide in [`../source-adapters/`](../source-adapters/).

Establish the project baseline before auditing, documenting, planning, or implementing.

## Select the profile first

Choose Express only when all eligibility conditions in `Workflow-Profiles.md` are true: one bounded source scope, one coherent implementation result, at most one task, and no meaningful architecture, integration, persistence, authentication, API, migration, operational, or unresolved product-decision risk.

### Express

Use [`00-express-workpack.md`](00-express-workpack.md) and create or update `WORKPACK.md` from [`../templates/WORKPACK.template.md`](../templates/WORKPACK.template.md).

Record control state, eligibility, exact source snapshots, repository commit, scope, source authority, constraints, blockers, and next permitted action inside the workpack. Do not create the larger profile artifact set while Express remains valid.

### Lite, Standard, and Full

Create or update:

- `SOURCE-BASELINE.md` from `templates/SOURCE-BASELINE.template.md`;
- `PROJECT-CONTEXT.md` from `templates/PROJECT-CONTEXT.template.md`;
- `WORKFLOW-STATE.md` from `templates/WORKFLOW-STATE.template.md`.

Record exact design scope and snapshot, repository commit and scope, applicable runtime, documentation, and assets, source authority, included and excluded scope, constraints, quality expectations, workflow profile, execution mode, blockers, and next permitted action.

For every profile, do not treat mutable URLs or branch names as immutable. Do not advance while a material baseline is ambiguous or Unverified without an explicit exception.

Perform two reviews:

1. completeness and correctness;
2. consistency, source integrity, authority, risks, and uncertainty.

End with files changed, active snapshot IDs, profile, mode, blockers, Stage 0 status, and next permitted action.
