# Project Configuration

`design-workflow.config.json` is the canonical, version-controlled project configuration for an implementation repository. It gives every new chat, agent, and collaborator the same stable project identity and working boundaries without relying on conversation memory.

It is **not** executable workflow state. Do not place it under `.workflow/`, and do not treat it as a substitute for source snapshots, stage artifacts, or the workflow record.

## Canonical location

The file lives at the implementation repository root:

```text
design-workflow.config.json
```

Use [`../schemas/design-workflow-config.schema.json`](../schemas/design-workflow-config.schema.json) for current configuration v3 and [`../templates/design-workflow.config.template.json`](../templates/design-workflow.config.template.json) for new projects. Historical schemas remain available as [`../schemas/design-workflow-config.v2.schema.json`](../schemas/design-workflow-config.v2.schema.json) and [`../schemas/design-workflow-config.v1.schema.json`](../schemas/design-workflow-config.v1.schema.json).

## Ownership

Configuration v3 owns stable project-level identity and boundaries:

- project name;
- implementation repository identity;
- repository-relative implementation root;
- saved working branch;
- Figma source and authorized editing scope;
- optional deployment adapter identity plus stable project URL;
- optional production URL;
- the user's chosen review style.

Connected tools remain authoritative for the **current state** of configured resources. The configuration answers “which resource belongs to this project”; GitHub, Figma, and runtime tools answer “what is its current state”. Deployment evidence and provider state are owned by [Deployment-Adapters.md](Deployment-Adapters.md), not by this configuration file.

The file is normal version-controlled repository content. Humans and authorized agents may update it when project configuration intentionally changes. It is never mutated through workflow-record commands.

## Bootstrap locator

A repository manifest cannot locate itself in a brand-new host conversation. ChatGPT Project instructions may therefore keep one repository locator:

```text
Repository: <REPOSITORY_URL>
```

That value is only a bootstrap pointer, not a second project-configuration authority. After locating the repository, read `design-workflow.config.json` on the default branch first. The default-branch configuration is the canonical project configuration. For configuration v2 and v3, follow `repository.workingBranch` before reading workflow state and verify that its configuration is a mirror of the canonical configuration by comparing the derived configuration revision. A revision mismatch is configuration drift and a blocker; do not silently choose the working-branch copy or rewrite either branch to make them agree. An explicit conflicting working ref, missing saved branch, or inaccessible branch is also a blocker. For v1, preserve the current authoritative ref or the default branch when none is established.

The configuration's `repository.url` must identify the same repository as the locator/current repository context. A mismatch is a configuration error; report it and do not silently switch repositories.

Project configuration does not need to exist before the conversation starts. When it is absent, begin from the repository locator and resolve required project context progressively. The configuration must be complete and valid before executable workflow initialization.

## First setup

Before first workflow initialization:

1. locate the implementation repository;
2. preserve `design-workflow.config.json` when it already exists;
3. when absent, resolve the pinned toolkit revision and use this contract/template;
4. establish required values from explicit user intent and authoritative sources;
5. ask only for required values that remain genuinely ambiguous or consequential;
6. create and commit configuration v3 before workflow initialization;
7. verify the committed file and repository identity.

Do not invent authorized Figma editing scope. Inspection may identify a supplied node/page/section/frame, but ambiguous edit authority requires a human decision before the configuration is written or broadened.

For an initialized legacy project, read the existing configuration before further substantive work. Migrate configuration v2 deterministically. Configuration v1 requires explicit adoption of the established working branch and the user's review style; do not silently reconstruct either value.

## Session startup

At every new agent session, inspect for project configuration before substantive design, implementation, or deployment work. When configuration is absent, repository inspection needed to establish it is allowed; follow **First setup** and do not commit partial configuration.

When it exists:

- treat the default-branch configuration as canonical project context;
- do not replace stable values from conversational inference;
- for v2/v3, compare the derived configuration revision of the saved working-branch copy with the canonical default-branch revision before reading workflow state;
- treat a revision mismatch as configuration drift that must be resolved explicitly rather than as permission to prefer either branch silently;
- use connected tools to verify current state;
- report material drift instead of silently rewriting the file.

An explicit user request may change project configuration. Persist the approved change on the default branch before treating it as shared truth, then deliberately synchronize the working-branch mirror before substantive workflow work continues.

## Derived configuration revision

Every valid supported project configuration has a derived semantic revision. The revision identifies the configuration data rather than the file bytes, so harmless JSON formatting differences do not create false drift.

Derivation is deterministic:

1. validate the configuration under its supported contract;
2. recursively sort object keys while preserving array order;
3. serialize the canonical value as compact JSON;
4. compute SHA-256 over the UTF-8 serialization.

The read-only command:

```bash
design-workflow project check --json
```

exposes the result as:

```json
{
  "configurationRevision": {
    "algorithm": "sha256",
    "digest": "<64-character-lowercase-hex>"
  }
}
```

Whitespace, indentation, and object-property ordering therefore do not change configuration identity. A supported semantic value change, including a schema-version change, does change the revision. Invalid configuration receives no trusted revision.

The revision is **derived, never persisted as another authority**. Do not add it to `design-workflow.config.json`, `.workflow/workflow-record.json`, or `.workflow/generated/*`. The default-branch configuration remains canonical; a working-branch copy is only a version-controlled mirror whose derived revision must match before executable workflow state on that branch is trusted.

## Configuration v3 shape

```json
{
  "schemaVersion": 3,
  "project": { "name": "Audiophile Ecommerce" },
  "repository": {
    "url": "https://github.com/example/audiophile-ecommerce",
    "implementationRoot": "frontend/",
    "workingBranch": "design/initial-ui"
  },
  "design": {
    "provider": "figma",
    "url": "https://www.figma.com/design/...",
    "scope": "🤖 Workflow"
  },
  "deployment": {
    "provider": null,
    "projectUrl": null,
    "productionUrl": null
  },
  "workflow": { "reviewStyle": "brief-and-final" }
}
```

### Implementation root

`repository.implementationRoot` is repository-relative: use `.` for repository root or a relative path such as `frontend/` or `apps/web/`. Never use an absolute path or `..` escape.

Scope app-code inspection, edits, app-specific commands, architecture, and validation to this root by default. Reading repository instructions outside it does not expand the edit boundary. Go outside only for required repo-wide integration.

### Figma scope

`design.scope` is the primary authorized Figma editing boundary. Do not edit outside it unless the human explicitly authorizes a configuration change. Read-only dependency inspection outside scope does not grant edit authority.

### Deployment

Configuration v3 stores provider-neutral deployment identity:

- `deployment.provider` is `null` or a registered deployment-adapter id such as `vercel`;
- `deployment.projectUrl` is the stable HTTPS project locator for that provider;
- `deployment.productionUrl` is an optional HTTPS production URL.

`provider` and `projectUrl` are paired: either both are configured or both are `null`. The JSON schema intentionally does not enumerate provider names; the runtime validator checks a non-null provider against [`adapter-catalog.json`](adapter-catalog.json). Adding another deployment adapter therefore does not require configuration v4.

These fields identify configured resources; they are not proof that a deployment exists, is healthy, or matches the implementation under review. When runtime evidence becomes relevant, follow [Deployment-Adapters.md](Deployment-Adapters.md) and resolve current provider state through authoritative tools. A `null` deployment identity means deployment is not configured unless an approved requirement establishes another runtime source; it does not block implementation validation by itself.

Configuration v2's `deployment.vercelProjectUrl` remains readable only as a legacy field and migrates to `provider: "vercel"` plus the same `projectUrl`. It is not valid in configuration v3.

## Review style and working branch

Configuration v3 requires `repository.workingBranch` and `workflow.reviewStyle`. Accepted current values are:

- `brief-and-final` — initializes a new run in Continuous documentation and represents the human-facing **Brief and final review** experience;
- `every-stage` — initializes a new run in Gated mode.

When no review style is already saved, ask the user once during progressive setup before first workflow initialization; it is not a prerequisite for starting the conversation. Recommend **Brief and final review** but never treat the unresolved template placeholder as a selection.

Configuration v2 remains readable with legacy identifier `brief-and-preview`; at runtime it normalizes to the same `brief-and-final` semantics and deterministic migration rewrites the stored identifier. The preference does not itself authorize implementation, change an active mode, or record stage/task progress. The canonical mode can change only through the CLI under the documented approval policy.

For a newly configured project, default the proposed working branch to `design/initial-ui`. Commit configuration and the caller on the default branch before creating the working branch from that setup commit. Preserve an established branch during adoption. Do not recreate a missing branch or reuse an unrelated existing branch without resolving the conflict. Before trusting workflow state on the working branch, require its configuration mirror to produce the same derived revision as the canonical default-branch configuration.

## Configuration migration

The current schema is configuration v3. Configuration v2 and v1 remain readable; neither is a second writable current format.

Run:

```bash
design-workflow project migrate --to 3
```

for a valid v2 configuration. Migration is deterministic and idempotent:

- `schemaVersion: 2` becomes `3`;
- non-null `deployment.vercelProjectUrl` becomes `deployment.provider: "vercel"` and the same `deployment.projectUrl`;
- null `vercelProjectUrl` becomes null provider/project URL;
- `deployment.productionUrl` is preserved;
- `brief-and-preview` becomes `brief-and-final`;
- `every-stage` remains unchanged;
- project, repository, design, and working-branch values are preserved.

Configuration v1 has no saved working branch or review style, so those decisions are never guessed. Adopt explicitly:

```bash
design-workflow project migrate --to 3 \
  --working-branch <established-branch> \
  --review-style <brief-and-final|every-stage>
```

Legacy v1 deployment URIs that do not satisfy current HTTPS requirements also require an explicit configuration correction before migration can succeed. A failed migration leaves the file unchanged. Migrating an already-current v3 configuration is a no-op.

Migration changes the semantic configuration revision because the canonical schema/shape changes. Persist the resulting v3 configuration on the default branch, deliberately synchronize the working-branch mirror, then compare derived revisions before continuing substantive work.

## Relationship to workflow state

```text
design-workflow.config.json
    stable project identity + working boundaries
    default-branch copy is canonical
    working-branch copy is a revision-checked mirror
    normal version-controlled project content

.workflow/workflow-record.json
    executable workflow state
    mutated only by design-workflow

.workflow/generated/*
    read-only executable-state projections
```

Stage 0 artifacts such as `PROJECT-CONTEXT.md` and `WORKPACK.md` own workflow-specific evidence, goals, constraints, risks, and snapshot references. They may reference configuration but must not become a second authority for its stable values.

A configuration change after planning baseline is a real project change. Do not classify it as harmless workflow-control churn; assess impact before implementation continues.

Project configuration versioning is independent of workflow-record schema v2 and remote-command protocol v1. Configuration contains settings, never stage/task status, plugin credentials, capability observations, approval evidence, or a persisted configuration digest.

## Security

Do not store secrets, access tokens, private keys, passwords, or credentials in `design-workflow.config.json`. It is expected to be committed and may be public.
