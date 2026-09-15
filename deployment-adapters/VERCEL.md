# Vercel Deployment Adapter

This adapter translates Vercel deployment state into the provider-neutral runtime evidence contract in [`../workflow/Deployment-Adapters.md`](../workflow/Deployment-Adapters.md).

It does not make Vercel a workflow prerequisite. Use it only when Vercel is configured or when an approved requirement explicitly needs a Vercel runtime/preview.

## Adapter identity

- Adapter/provider ID: `vercel`
- Evidence role: optional or required Validation runtime, depending on approved scope
- Project configuration v2 locator: `deployment.vercelProjectUrl` when present

A `null` `deployment.vercelProjectUrl` means Vercel identity is not configured. Do not invent a project or block unrelated repository/planning work because of that absence.

## Discovery

When deployment evidence becomes relevant:

1. read the configured Vercel project URL when present;
2. inspect the connected Vercel project through the available provider capability;
3. locate the deployment for the exact tested implementation commit;
4. verify provider status and deployment commit identity;
5. inspect the resulting runtime URL;
6. normalize the result for product evidence assessment.

If configuration names a Vercel project but the provider cannot be inspected, record deployment evidence as blocked. Do not silently substitute another Vercel project, production alias, or deployment.

## Normalization

Map a Vercel deployment to normalized evidence only after inspection:

```json
{
  "provider": "vercel",
  "implementationCommit": "<40-character implementation SHA>",
  "deployment": {
    "commit": "<same implementation SHA>",
    "status": "ready",
    "url": "https://<deployment>.vercel.app",
    "inspected": true
  }
}
```

Vercel's provider status `READY` maps to normalized `ready`. Other statuses remain unverified/blocked until the provider reports a usable deployment and the runtime can be inspected.

## Commit binding

The deployment's Git commit must equal the tested Implementation output commit.

- A moving alias that now points to a different commit is not valid evidence.
- A deployment for an earlier implementation commit becomes historical after a correction.
- Later workflow-only bookkeeping commits do not change which implementation commit was tested or deployed.
- A replacement implementation commit requires fresh validation and fresh deployment evidence when runtime evidence is required.

## Runtime inspection

A `READY` deployment alone is insufficient. The resulting HTTPS URL must actually be inspected before `inspected: true` is recorded.

Record what was observed and distinguish provider readiness from application correctness. Runtime inspection may support visual, responsive, interaction, accessibility, asset, or integration evidence, but it never replaces the corresponding validation requirements.

When used for Stage 11 evidence, bind the inspected deployment as a `SRC-RUN-*` Validation runtime parented to the exact Implementation output snapshot under [`../workflow/Source-Snapshots.md`](../workflow/Source-Snapshots.md).

## Failure behavior

Report the specific condition:

- no configured Vercel project — `Not configured` unless runtime evidence is explicitly required;
- provider/plugin unavailable — deployment evidence blocked;
- deployment missing for the tested commit — deployment evidence blocked;
- deployment not `READY` — deployment evidence blocked;
- deployment commit mismatch — stale/invalid evidence;
- runtime URL cannot be inspected — deployment evidence blocked;
- implementation CI/checks failed — implementation validation remains failed regardless of Vercel status.

If Vercel evidence is optional, these conditions do not erase otherwise valid implementation evidence. If the approved scope requires a runtime, final acceptance remains blocked until the required runtime evidence is established or the requirement is explicitly changed.

## Production boundary

Preview/runtime inspection does not authorize production promotion. Final implementation acceptance does not merge the pull request, change aliases, or publish production unless those actions are separately and explicitly in scope.
