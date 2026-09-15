# Astro implementation adapter

This adapter is the maintained implementation capability for new Astro + TypeScript projects. It is an internal workflow component, not a consumer onboarding route or downloadable project starter.

## Responsibility

The adapter owns only the baseline application scaffold under [`scaffold/`](scaffold/) and the deterministic builder in [`../../scripts/build-astro-scaffold.mjs`](../../scripts/build-astro-scaffold.mjs).

It provides:

- Astro + TypeScript application structure;
- exact dependency and lockfile pairing;
- strict TypeScript configuration;
- baseline responsive/accessibility smoke tests;
- commit-bound GitHub Actions validation with machine-readable evidence.

It does **not** own:

- ChatGPT Project instructions;
- `design-workflow.config.json`;
- the pinned GitHub remote caller;
- workflow state or approvals;
- Figma scope selection;
- deployment configuration;
- release/publication provenance.

Those concerns remain with their canonical workflow contracts and bootstrap mechanisms.

## Agent use

Inspect the implementation repository before applying this adapter. Preserve an existing implementation instead of replacing it. Use the scaffold only when a maintained Astro implementation is required and no compatible application exists yet.

For repository-first remote setup, establish repository configuration and the pinned remote caller on the default branch first. Create or use the saved working branch from that setup commit, apply the Astro scaffold there, then classify and initialize the canonical workflow from the resulting implementation HEAD.

Build a clean scaffold with:

```bash
node scripts/build-astro-scaffold.mjs --output dist/astro-scaffold
```

The generated scaffold intentionally contains no workflow caller, Project Instructions, project-configuration template, toolkit runtime, toolkit license, or release provenance. Those are separate layers.
