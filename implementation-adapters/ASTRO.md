# Astro + TypeScript Implementation Adapter

Adapter ID: `astro-typescript`  
Support level: `maintained`

Use this adapter for either:

- a safely scaffoldable implementation root with no conflicting approved implementation requirement; or
- an existing Astro + TypeScript application whose repository evidence confirms Astro is already the implementation environment.

Do not use this adapter to replace an existing non-Astro application or to silently migrate an existing Astro JavaScript project to TypeScript.

## Classification evidence

For `adapt` mode, confirm the active `SRC-REPO-*` snapshot and inspect the configured implementation root for evidence such as:

- `astro` in the relevant package manifest;
- `astro.config.*`;
- Astro source conventions already used by the application;
- an established TypeScript configuration or TypeScript-first Astro source.

For `scaffold` mode, first satisfy the scaffoldability rules in [`../workflow/Implementation-Adapters.md`](../workflow/Implementation-Adapters.md). Absence of a recognized framework is not sufficient evidence by itself.

Record adapter, mode, support level, evidence, and constraints in the Stage 0 narrative owner.

## Scaffold mode

The maintained default for a new safely scaffoldable frontend is Astro + TypeScript.

Adapter resolution may happen before planning, but creating application files is Stage 10 implementation work. Do not scaffold during intake or use scaffolding to bypass required documentation, review, or approval gates.

The source repository's `starters/astro/` directory is a development-only scaffold and validation fixture. It is intentionally excluded from the packaged workflow runtime. Toolkit maintainers use it to verify the maintained Astro baseline; implementation agents should follow this adapter contract and the approved project scope rather than requiring an installed package or consumer repository to contain the fixture. Sample pages, sample tests, and fixture content are never product requirements.

When scaffolding:

- preserve repository-level workflow/configuration files already present;
- create application files only inside the configured implementation root except for required repo-wide integration;
- keep dependencies minimal and justified by the approved implementation;
- prefer Astro components, TypeScript, semantic HTML, and shared CSS over framework additions that are not required by the design or project;
- remove or replace fixture-specific sample content and tests when they are not part of the approved result.

## Adapt mode

Preserve the existing Astro application's architecture and conventions unless the approved plan explicitly changes them.

Inspect before editing:

- package manager and lockfile;
- package scripts;
- Astro configuration;
- TypeScript configuration;
- source/layout/component organization;
- styling conventions and design tokens;
- existing tests and CI;
- asset conventions;
- deployment integration when relevant.

Do not introduce React, Tailwind, a backend, a state library, or another dependency merely because Figma-generated reference code uses it.

## Figma translation

Treat Figma-generated code as reference evidence, not target architecture.

Translate the approved design into the project's Astro structure using:

- semantic HTML and accessible native interactions where practical;
- Astro components for reusable presentational structure;
- TypeScript where behavior or project conventions require it;
- existing project CSS/token conventions first, otherwise shared CSS custom properties and maintainable component/page styles;
- repository-owned durable assets with meaningful names.

Do not use expiring Figma export URLs or localhost asset-server URLs as runtime dependencies.

## Validation baseline

Apply [`../workflow/Validation-Rules.md`](../workflow/Validation-Rules.md) and the project's actual scripts. The maintained Astro baseline should include, when the maintained scaffold or equivalent project commands provide them:

1. deterministic dependency installation from the committed lockfile;
2. Astro/type checking;
3. production build;
4. browser installation/setup required by the test runner;
5. browser/end-to-end checks against the built result.

Browser coverage should be extended to approved behavior, keyboard interaction, responsive behavior, durable assets, and accessibility rather than relying only on starter smoke tests.

If an existing Astro project uses different but equivalent native commands, use the repository's commands and record exactly what ran. Never claim a maintained check passed when it was skipped or unavailable.

## Preview evidence

A deployment preview is not needed to classify or begin the workflow. When the approved project/review contract requires preview evidence and a deployment provider is configured, bind the inspected deployment to the exact tested implementation commit.

A READY deployment alone does not prove functional, accessible, or visual correctness. Distinguish automated validation, any actually inspected screenshots/runtime behavior, and final human visual acceptance.

## Architecture boundary

Choosing this maintained adapter for a straightforward scaffoldable static frontend does not by itself require a Stage 6 architecture artifact. Apply the normal architecture trigger rules when routing, shared state, APIs, persistence, authentication, SSR, deployment architecture, security, migration, or similar concerns become material.
