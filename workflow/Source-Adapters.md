# Source Adapters

Source adapters define how design and reference sources are inspected and translated into the workflow's provider-neutral evidence model. They are source-format guidance, not alternate workflows, source-authority rules, executable state, or project configuration.

The canonical workflow stages, source authority, source snapshots, approvals, and validation rules remain unchanged. A source adapter answers a narrower question: **what kind of source is being inspected, which evidence can it support, and which source-specific limitations apply?**

## Ownership boundary

[`Source-Authority.md`](Source-Authority.md) owns which source may decide a question and how conflicts are resolved. [`Source-Snapshots.md`](Source-Snapshots.md) owns source identity, pin strength, verification, and lineage. This contract owns source-format classification and delegation to source-specific inspection guidance.

Source-adapter selection is an agent-owned observation derived from the actual source being inspected. It is not executable workflow state and does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json` as a second authority.

Stable source identity may exist in project configuration when the configuration contract defines it. The adapter still does not own that configuration; it interprets the configured or discovered source using authoritative provider evidence.

## Selection rules

Resolve source guidance from actual evidence rather than from user persona or conversation memory:

1. identify the source or sources that materially support the current work;
2. classify their actual formats;
3. load only the matching adapter;
4. when multiple source formats jointly define the work, use the mixed-sources adapter and then inspect only the contributing formats needed to resolve the question;
5. if the source format is unknown or inaccessible, report that capability/evidence blocker instead of inventing source state.

Do not ask the human to choose an internal source adapter merely because several adapters exist.

## Adapter contract

A source adapter should define, as applicable:

- the evidence that should be captured for a source snapshot;
- stable references, revisions, node/page/URL identifiers, checksums, or timestamps that strengthen traceability;
- which observations the source can directly support;
- which conclusions the source cannot independently establish;
- source-specific inspection areas such as components, responsive behavior, interactions, assets, content, or runtime behavior;
- limitations caused by mutable sources, permissions, incomplete exports, or unavailable dependencies;
- a completion checklist that separates observation from inference and recommendation.

Adapters normalize source evidence into the existing source-snapshot and artifact model. They do not create a parallel evidence registry or redefine decision authority.

## Relationship to the workflow

Source-adapter guidance can be needed before initialization, during Stage 0 source capture, during Stage 1 audit, or later when a stage must inspect a particular source. The orchestration resource manifest exposes source adapters conditionally so agents load only the format that is actually relevant.

Source preparation and source inspection remain distinct. Figma preparation is governed by [`../source-adapters/FIGMA-PREPARATION.md`](../source-adapters/FIGMA-PREPARATION.md) and remains outside executable workflow state. Preparing a source does not create a hidden workflow stage or replace the formal audit.

## Current adapters

- [`FIGMA.md`](../source-adapters/FIGMA.md) — Figma design, FigJam, and Figma Slides evidence.
- [`SCREENSHOTS.md`](../source-adapters/SCREENSHOTS.md) — screenshot and static image evidence.
- [`PDF.md`](../source-adapters/PDF.md) — PDF evidence.
- [`EXISTING-WEBSITE.md`](../source-adapters/EXISTING-WEBSITE.md) — existing website/runtime reference evidence.
- [`MIXED-SOURCES.md`](../source-adapters/MIXED-SOURCES.md) — coordinated inspection when multiple source formats materially contribute.

Additional source adapters may be added without changing workflow stages, profiles, approvals, or asking the user to select a different workflow route.
