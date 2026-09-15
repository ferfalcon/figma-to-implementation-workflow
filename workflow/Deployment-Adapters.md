# Deployment Adapters

Deployment adapters define how optional runtime evidence is discovered, normalized, inspected, and connected to an implementation result. They are evidence adapters, not alternate workflows, execution modes, implementation adapters, or executable workflow state.

The canonical workflow remains valid without a deployment provider unless an approved project requirement explicitly makes a runtime environment part of acceptance. Repository output, automated validation, and deployment/runtime evidence are separate evidence layers.

## Core invariant

An implementation does not require a deployment to be valid.

A deployment is additional runtime evidence when a provider is configured and relevant. Missing deployment evidence must never be reported as a successful runtime check, but its absence does not invalidate otherwise successful implementation evidence unless the approved scope explicitly requires a runtime or preview.

When deployment evidence is supplied, it must be tied to the exact tested implementation commit. A provider alias, environment, or URL that resolves to another commit is not evidence for the reviewed result.

## Ownership boundary

[`Validation-Rules.md`](Validation-Rules.md) owns generic implementation validation. [`Source-Snapshots.md`](Source-Snapshots.md) owns `SRC-RUN-*` runtime lineage. [`ChatGPT-Experience.md`](ChatGPT-Experience.md) owns when the ordinary-ChatGPT product asks for or reports deployment capability. This contract owns provider-neutral deployment evidence and adapter behavior.

Deployment identity may be stored in project configuration when already known. Deployment availability, status, inspected URL, and commit identity are live provider observations and must not be copied into executable workflow state as a second authority.

## Deployment states

Treat deployment capability explicitly as one of these states:

- **Not configured** — no deployment provider is configured or required for the approved result. Runtime evidence is `Not applicable`; implementation validation may continue.
- **Available** — the provider is configured, the deployment can be inspected, and commit-bound runtime evidence can be produced.
- **Blocked** — deployment evidence is expected or configured but cannot currently be established, inspected, or matched to the tested implementation commit.

`Blocked` applies to the deployment evidence layer. It blocks final acceptance only when the approved scope requires runtime evidence. Otherwise the implementation evidence remains independently reportable and the missing runtime evidence must stay visible as a limitation.

## Normalized evidence

Provider adapters should normalize inspected runtime evidence to this conceptual shape before product-level assessment:

```json
{
  "provider": "vercel",
  "implementationCommit": "<40-character SHA>",
  "deployment": {
    "commit": "<40-character SHA>",
    "status": "ready",
    "url": "https://example-preview.invalid",
    "inspected": true
  }
}
```

The provider-specific status is mapped to the normalized `ready` state only after the adapter has verified that the provider considers the deployment usable.

A valid inspected deployment requires:

- a named provider;
- the exact implementation commit under review;
- deployment commit identity equal to that implementation commit;
- normalized status `ready`;
- an inspected HTTPS runtime URL.

Optional deployment evidence that fails these rules cannot be presented as verified runtime evidence. Required deployment evidence that fails these rules blocks the runtime-dependent acceptance claim.

## Discovery and verification

Resolve deployment capability only when it becomes relevant:

1. inspect existing project configuration and repository/provider integration evidence;
2. determine whether runtime evidence is required by approved scope or merely available as additional evidence;
3. load only the matching deployment adapter;
4. inspect the provider's project/deployment state;
5. bind evidence to the tested implementation commit;
6. create or reference a `SRC-RUN-*` Validation runtime snapshot when runtime evidence is actually used;
7. report provider unavailability, stale commits, failed deployments, or uninspectable URLs honestly.

Do not ask the human to choose a deployment provider merely because adapters exist. Do not create or connect a provider unless that setup is authorized and needed.

## Relationship to Stage 11

Stage 11 always evaluates the applicable implementation evidence. Deployment/runtime evidence is an additional validation layer when applicable.

- No configured or required runtime: record deployment as not applicable and continue with repository/CI evidence.
- Runtime available: inspect it and connect it to the exact Implementation output snapshot.
- Runtime required but unavailable: record the blocker and do not claim final acceptance.
- Runtime optional but unavailable: keep the limitation visible without converting successful implementation checks into failures.

A deployment being `ready` never substitutes for build, test, accessibility, responsive, interaction, or source-lineage validation.

## Current adapters

- [`VERCEL.md`](../deployment-adapters/VERCEL.md) — Vercel preview/runtime evidence adapter.

Additional deployment adapters may be added without changing workflow stages, implementation adapters, or asking users to select a different workflow route.
