# Implementation Adapters

Implementation adapters define how the workflow translates an approved design and plan into the selected implementation repository. They are implementation guidance, not alternate workflows, user personas, execution modes, or executable workflow state.

The canonical workflow stages, profiles, approvals, source lineage, and validation rules remain unchanged. An adapter answers a narrower question: **what implementation environment is this work being applied to, and which framework-specific constraints apply?**

## Ownership boundary

Implementation-adapter selection is an agent-owned repository observation derived from the configured `repository.implementationRoot` and the active repository snapshot. It does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json`.

Record the resolved implementation capability in the current profile's Stage 0 narrative owner (`WORKPACK.md`, `PROJECT-CONTEXT.md`, or equivalent) and cite the `SRC-REPO-*` snapshot used to resolve it.

A useful capability record contains:

- implementation root;
- repository snapshot ID;
- adapter ID;
- mode: `scaffold` or `adapt`;
- support level: `maintained` or `best-effort`;
- evidence used for classification;
- constraints and unresolved blockers.

Do not infer framework identity from conversation memory when repository evidence is available.

## Selection precedence

Resolve the adapter from the implementation root in this order:

1. **Explicit approved implementation requirement.** A confirmed project requirement that names an implementation technology overrides the maintained default.
2. **Existing application evidence.** Preserve an existing application framework unless an approved migration explicitly changes it.
3. **Safely scaffoldable implementation root.** When no application framework exists and no requirement conflicts, select the maintained Astro + TypeScript adapter in `scaffold` mode.
4. **Ambiguous or unknown application evidence.** Inspect further. If multiple plausible applications, conflicting roots, or unfamiliar application-significant files prevent safe classification, stop and ask only for the consequential scope or architecture decision that cannot be inferred.

The human does not choose an internal adapter merely because several adapters exist.

## Support matrix

| Repository condition | Adapter | Mode | Support | Required behavior |
|---|---|---|---|---|
| Empty or safely scaffoldable implementation root | `astro-typescript` | `scaffold` | maintained | Use Astro + TypeScript as the maintained default after implementation approval. |
| Existing Astro + TypeScript application | `astro-typescript` | `adapt` | maintained | Preserve and extend the existing Astro application. |
| Existing application using another framework | `existing-framework` | `adapt` | best-effort | Preserve the framework and repository conventions; do not inject Astro. |
| Existing Astro application whose TypeScript posture does not match the maintained adapter | `existing-framework` | `adapt` | best-effort | Preserve the existing application; do not silently migrate it to TypeScript. |
| Unknown non-empty application root | unresolved | — | blocked | Inspect further; never treat it as empty merely because the framework is unfamiliar. |
| Multiple plausible application roots | unresolved | — | blocked | Resolve the implementation boundary before planning or editing application code. |

## Scaffoldability

A root is scaffoldable only when repository inspection demonstrates that it does not already contain application-significant implementation content that would be replaced or reinterpreted by scaffolding.

Repository metadata, workflow/configuration files, documentation, licenses, and similar non-application material may coexist with a scaffoldable root. Unfamiliar source files, package manifests, framework configuration, build configuration, application directories, or existing runtime assets are evidence to inspect, not permission to overwrite.

When uncertain, classify the root as unresolved rather than scaffoldable.

## When scaffolding happens

Adapter resolution may happen during pre-initialization intake or Stage 0 so planning can use the correct implementation constraints. **Application scaffolding itself is implementation work.** Do not create the Astro application during intake merely because the adapter resolved to `astro-typescript`.

For a new scaffoldable project:

1. resolve and record the maintained adapter;
2. complete the normal documentation, planning, review, and approval stages;
3. enter Stage 10 and start the approved implementation task;
4. run `design-workflow implementation scaffold astro-typescript` through the available execution transport;
5. validate the resulting implementation with the adapter-specific and project-specific checks.

The scaffold command is a Stage-10 implementation capability of the canonical toolkit. It reads the configured `repository.implementationRoot`, reuses the canonical Stage-10 implementation authorization policy, and does not persist adapter selection into configuration or workflow state. The command must fail closed when workflow state is invalid, the current task is not in progress, execution is still Continuous documentation, existing application-significant content makes the root unsafe to scaffold, or a differing scaffold-owned runtime file would be overwritten.

A maintained scaffold may also render narrowly defined repository-level integration outside the implementation root when the adapter contract requires it. The Astro adapter currently owns only `.github/workflows/design-workflow-ui.yml` for that purpose. Existing repository metadata is preserved and unknown application content is never reinterpreted as disposable merely to make scaffolding succeed.

This preserves the workflow's authorization boundary while making the toolkit revision itself the deterministic source of scaffold bytes.

## Architecture interaction

Selecting the maintained Astro adapter for an otherwise straightforward scaffoldable frontend does not, by itself, make Stage 6 architecture required. It is a resolved product capability.

Normal architecture rules still apply when the project introduces meaningful routing, shared state, APIs, persistence, authentication, server rendering, framework migration, deployment architecture, security, observability, or other concerns defined by the canonical workflow.

## Validation

[`Validation-Rules.md`](Validation-Rules.md) remains canonical. Adapters narrow those generic rules into framework-specific commands and evidence; they do not weaken them.

- Required project checks must actually run and pass.
- An adapter may define a maintained baseline of checks.
- Existing-framework work should use the repository's native validation commands and record unavailable or inapplicable checks honestly.
- Deployment/runtime evidence is owned separately by [`Deployment-Adapters.md`](Deployment-Adapters.md); an implementation adapter must not make a deployment provider a hidden prerequisite.
- A deployment being unavailable does not convert unexecuted validation into a pass or successful implementation evidence into a failure when runtime evidence is not required.

## Current adapters

- [`ASTRO.md`](../implementation-adapters/ASTRO.md) — maintained Astro + TypeScript scaffold/adaptation path.
- [`EXISTING-FRAMEWORK.md`](../implementation-adapters/EXISTING-FRAMEWORK.md) — best-effort preservation path for existing non-maintained implementation environments.

Additional maintained adapters may be added later without changing the workflow stages or asking the user to choose a different workflow route.
