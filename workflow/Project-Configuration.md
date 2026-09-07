# Project Configuration

`design-workflow.config.json` is the canonical, version-controlled project configuration for an implementation repository. It gives every new chat, agent, and collaborator the same stable project identity and working boundaries without relying on conversation memory.

It is **not** executable workflow state. Do not place it under `.workflow/`, and do not treat it as a substitute for source snapshots, stage artifacts, or the workflow record.

## Canonical location

The file lives at the implementation repository root:

```text
design-workflow.config.json
```

Use [`../schemas/design-workflow-config.schema.json`](../schemas/design-workflow-config.schema.json) and [`../templates/design-workflow.config.template.json`](../templates/design-workflow.config.template.json).

## Ownership

The configuration owns stable project-level identity and boundaries:

- project name;
- implementation repository identity;
- repository-relative implementation root;
- Figma source and authorized editing scope;
- optional Vercel project URL;
- optional production URL;
- in configuration v2, the working branch and the user's chosen review style.

Connected tools remain authoritative for the **current state** of configured resources. The configuration answers “which resource belongs to this project”; GitHub, Figma, and runtime tools answer “what is its current state”.

The file is normal version-controlled repository content. Humans and authorized agents may update it when project configuration intentionally changes. It is never mutated through workflow-record commands.

## Bootstrap locator

A repository manifest cannot locate itself in a brand-new host conversation. ChatGPT Project instructions may therefore keep one repository locator:

```text
Repository: <REPOSITORY_URL>
```

That value is only a bootstrap pointer, not a second project-configuration authority. After locating the repository, read `design-workflow.config.json` on the default branch first. For configuration v2, follow `repository.workingBranch` before reading workflow state and verify that stable configuration agrees on both branches. An explicit conflicting working ref, missing saved branch, or inaccessible branch is a blocker. For v1, preserve the current authoritative ref or the default branch when none is established.

The configuration's `repository.url` must identify the same repository as the locator/current repository context. A mismatch is a configuration error; report it and do not silently switch repositories.

## First setup

Before first workflow initialization:

1. locate the implementation repository;
2. preserve `design-workflow.config.json` when it already exists;
3. when absent, resolve the pinned toolkit revision and use this contract/template;
4. establish required values from explicit user intent and authoritative sources;
5. ask only for required values that remain genuinely ambiguous or consequential;
6. create and commit the configuration before workflow initialization;
7. verify the committed file and repository identity.

Do not invent authorized Figma editing scope. Inspection may identify a supplied node/page/section/frame, but ambiguous edit authority requires a human decision before the configuration is written or broadened.

For an initialized legacy project with no configuration, create and commit it before further substantive workflow work. Existing Project Instructions, repository evidence, source snapshots, and explicit user input may support migration, but do not silently reconstruct consequential scope or implementation root.

## Session startup

At every new agent session, resolve project configuration before substantive design/repository/deployment work.

When it exists:

- treat stable values as canonical project context;
- do not replace them from conversational inference;
- use connected tools to verify current state;
- report material drift instead of silently rewriting the file.

An explicit user request may change project configuration. Persist the approved change before treating it as shared truth.

## Configuration shape

```json
{
  "schemaVersion": 2,
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
    "vercelProjectUrl": null,
    "productionUrl": null
  },
  "workflow": { "reviewStyle": "brief-and-preview" }
}
```

### Implementation root

`repository.implementationRoot` is repository-relative: use `.` for repository root or a relative path such as `frontend/` or `apps/web/`. Never use an absolute path or `..` escape.

Scope app-code inspection, edits, app-specific commands, architecture, and validation to this root by default. Reading repository instructions outside it does not expand the edit boundary. Go outside only for required repo-wide integration.

### Figma scope

`design.scope` is the primary authorized Figma editing boundary. Do not edit outside it unless the human explicitly authorizes a configuration change. Read-only dependency inspection outside scope does not grant edit authority.

### Deployment

`deployment.vercelProjectUrl` and `deployment.productionUrl` may be `null`. Do not invent deployment identity; resolve runtime state through authoritative tools when needed.

## Relationship to workflow state

```text
design-workflow.config.json
    stable project identity + working boundaries
    normal version-controlled project content

.workflow/workflow-record.json
    executable workflow state
    mutated only by design-workflow

.workflow/generated/*
    read-only executable-state projections
```

Stage 0 artifacts such as `PROJECT-CONTEXT.md` and `WORKPACK.md` own workflow-specific evidence, goals, constraints, risks, and snapshot references. They may reference configuration but must not become a second authority for its stable values.

A configuration change after planning baseline is a real project change. Do not classify it as harmless workflow-control churn; assess impact before implementation continues.

## Review style and working branch

Configuration v2 requires repository.workingBranch and workflow.reviewStyle. The accepted review-style values are brief-and-preview and every-stage. Ask the user once; recommend Brief and final preview but never treat the unresolved template placeholder as a selection.

The preference maps to the existing modes under [ChatGPT Experience](ChatGPT-Experience.md). It does not itself authorize implementation, change an active mode, or record stage/task progress. A new brief-and-preview run initializes in Continuous documentation; every-stage initializes in Gated. The canonical mode can change only through the CLI under the documented approval policy.

For a new starter, default the proposed working branch to design/initial-ui. Commit configuration and the caller on the default branch before creating the working branch from that setup commit. Preserve an established branch during adoption. Do not recreate a missing branch or reuse an unrelated existing branch without resolving the conflict.

## Version compatibility and adoption

The current schema is [configuration v2](../schemas/design-workflow-config.schema.json); [configuration v1](../schemas/design-workflow-config.v1.schema.json) remains readable. The dependency-free project-configuration reader validates both. The read-only CLI command is design-workflow project check --json, including through the pinned remote bridge.

A v1 configuration has no saved review style or working branch. Preserve its established ref and current execution mode; do not default it into the new experience. When the human chooses adoption, retain all existing fields, add the selected reviewStyle and the existing workingBranch, and write schemaVersion 2. Assess lineage impact and reconcile stable configuration on the default and working branches before continuing. Existing exact toolkit pins do not upgrade automatically.

Project configuration versioning is independent of workflow-record schema v2 and remote-command protocol v1. Configuration contains settings, never stage/task status, plugin credentials, capability observations, or approval evidence.

## Security

Do not store secrets, access tokens, private keys, passwords, or credentials in `design-workflow.config.json`. It is expected to be committed and may be public.
