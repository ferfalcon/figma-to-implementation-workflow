# Existing Framework Implementation Adapter

Adapter ID: `existing-framework`  
Support level: `best-effort`

Use this adapter when the configured implementation root already contains an application that is not covered by a maintained implementation adapter, including an existing Astro project whose current TypeScript posture does not match the maintained Astro + TypeScript path.

The purpose of this adapter is preservation: implement the approved design inside the repository's established environment without silently replacing or migrating that environment.

## Classification evidence

Inspect the active `SRC-REPO-*` snapshot and configured implementation root before planning implementation details. Identify, when present:

- package manifests and lockfiles;
- framework/build configuration;
- source entry points and application directories;
- package scripts;
- styling and component conventions;
- tests and CI;
- runtime/deployment configuration;
- repository instructions relevant to the implementation root.

Record the observed framework/environment, adapter, `adapt` mode, best-effort support level, evidence, and constraints in the Stage 0 narrative owner.

If the root contains multiple plausible applications or the framework cannot be established safely, do not guess. Resolve the implementation boundary or consequential technical decision before editing application code.

## Preservation rules

- Preserve the existing framework and package manager unless an approved architecture/migration decision explicitly changes them.
- Do not inject Astro merely because Astro is the maintained default for new scaffoldable projects.
- Do not rewrite a working application into another framework as an incidental part of implementing a design.
- Reuse existing components, tokens, utilities, assets, scripts, and conventions when they are suitable.
- Introduce dependencies only when the approved requirements and repository architecture justify them.
- Keep edits inside `repository.implementationRoot` except for required repo-wide integration.

A framework migration is not ordinary adapter selection. Treat it as project scope that normally requires explicit architecture handling and approval.

## Figma translation

Figma-generated reference code is evidence about visual and interaction intent, not authority over the repository's framework.

Translate the approved design into the existing application's native component, styling, routing, state, and interaction patterns. Preserve semantic HTML, keyboard behavior, focus behavior, responsive intent, and accessible names/relationships regardless of framework.

Save durable assets in the repository using existing asset conventions. Never depend on expiring Figma export URLs or localhost asset-server URLs at runtime.

## Validation

Apply [`../workflow/Validation-Rules.md`](../workflow/Validation-Rules.md) using the repository's native checks.

Inspect the actual available commands and run those applicable to the changed scope, such as:

- formatting/linting;
- type checking;
- build/compilation;
- unit/component tests;
- integration/end-to-end tests;
- accessibility checks;
- responsive/browser checks;
- deployment validation when required.

Do not fabricate an Astro-shaped validation contract for a different framework. Record required checks that are unavailable, skipped, blocked, or not applicable with the reason. Best-effort support does not reduce evidence honesty or final acceptance requirements.

## Preview evidence

A preview is conditional on project requirements and configured deployment capability. If a deployment provider exists and the approved review contract requires a preview, inspect a deployment tied to the tested implementation commit.

If no preview capability is configured, continue with repository-native validation when sufficient for the approved scope and report the missing runtime evidence explicitly. Do not claim runtime/visual checks that were not performed.

## Escalation

Stop and reassess architecture/profile when implementation reveals material framework migration, backend/persistence work, authentication, server-rendering changes, deployment architecture, security concerns, or another concern that exceeds the approved plan or current profile.
