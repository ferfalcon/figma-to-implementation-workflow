# Source Snapshots

Source snapshots make project artifacts reproducible by recording the exact design, repository, runtime, documentation, and asset baselines used to create them.

A source URL by itself is not a snapshot. Many URLs point to mutable content. The workflow must record either an immutable revision or enough time-bound evidence to describe what was actually inspected.

## Core model

Every project creates `SOURCE-BASELINE.md` during Stage 0 from `templates/SOURCE-BASELINE.template.md`.

`SOURCE-BASELINE.md` owns snapshot identity and details. Other artifacts reference snapshot IDs instead of copying mutable URLs, dates, or commit values throughout the documentation set.

Example artifact metadata:

```yaml
---
artifact: SPEC
status: Draft
baseline:
  design:
    - SRC-DS-001
  repository:
    - SRC-REPO-001
  runtime: []
  documentation:
    - SRC-DOC-001
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Use an empty list when a source category does not apply. Do not insert a placeholder snapshot ID that has not been defined.

## Snapshot namespaces

- `SRC-DS-*` — design sources such as Figma, screenshots, images, or PDFs;
- `SRC-REPO-*` — repository and code baselines;
- `SRC-RUN-*` — production, preview, staging, or local runtime observations;
- `SRC-DOC-*` — product, API, legal, design-system, or technical documentation;
- `SRC-ASSET-*` — asset bundles, fonts, images, icons, or other implementation inputs when they need independent pinning.

Each ID is defined once in `SOURCE-BASELINE.md` and never reused.

## Pin strength

Classify every snapshot honestly.

### Immutable

The referenced content cannot change without receiving a different identity.

Examples:

- Git commit SHA;
- content-addressed object;
- file with a recorded cryptographic checksum;
- immutable deployment identifier.

### Versioned

The source provides a stable named or numbered revision, but the workflow cannot independently guarantee content immutability.

Examples:

- a named Figma version;
- a versioned API specification;
- a release or document revision.

### Time-bound

The source was inspected at a recorded time, but the original location may change later.

Examples:

- a live Figma file without a pinned version;
- an existing website captured at a timestamp;
- a shared document without revision history access.

Time-bound snapshots must state their reproducibility limitations and should include exported evidence when practical.

### Unverified

The source identity or revision could not be confirmed. This classification is allowed only when the limitation is explicit.

A material Unverified source may block later stages.

## Required fields

Every snapshot record must include:

- snapshot ID;
- source category and type;
- title or purpose;
- canonical reference;
- exact included scope;
- captured or inspected timestamp with timezone;
- pin strength;
- immutable revision, version, checksum, or deployment ID when available;
- captured evidence location when available;
- access and reproduction instructions;
- known limitations;
- status: Active / Superseded / Invalid / Unverified.

Do not claim a source is immutable when only a timestamp or mutable URL is available.

## Source-specific rules

### Figma

Record:

- file URL and file key when available;
- page, section, frame, component, or node IDs in scope;
- named version, version URL, or version identifier when available;
- inspection timestamp and timezone;
- access mode and library dependencies;
- exported screenshots, PDFs, or other captured evidence when practical;
- whether the source is Immutable, Versioned, Time-bound, or Unverified.

A normal Figma design URL is mutable. Without a named version or exported checksum-backed capture, classify it as Time-bound.

### Screenshots, images, and PDFs

Record:

- file name and format;
- file size when available;
- SHA-256 checksum when tooling permits;
- page, region, or image scope;
- upload or acquisition date;
- storage or attachment reference;
- transformations or compression already applied.

A checksum pins the supplied file, not the unseen source from which it may have been exported.

### Existing websites

Record:

- exact page URLs;
- capture timestamp and timezone;
- viewport sizes;
- browser and relevant environment details;
- authentication or personalization state;
- screenshots, recordings, or archives when available;
- dynamic data and known capture limitations.

A live website observation is normally Time-bound even when its URL is stable.

### Repositories

Record:

- repository URL;
- commit SHA;
- branch for context;
- relevant application, package, or directory scope;
- submodule or lockfile state when relevant;
- uncommitted local changes or patches, when applicable;
- access or tooling limitations.

Use the commit SHA as the pin. A branch name alone is mutable and is not sufficient.

### Runtime deployments

Record:

- environment and URL;
- deployment or release ID;
- associated repository commit when known;
- capture timestamp;
- configuration or feature-flag state relevant to the review;
- test data or authentication state;
- known environment differences.

### Documentation

Record:

- path or URL;
- title and authority;
- revision, version, date, commit, or checksum;
- exact sections used;
- access limitations;
- whether the document is normative, informative, or historical.

## Artifact baseline references

Every workflow artifact created after Stage 0 must identify the snapshot IDs it relies on.

At minimum, metadata must reference:

- design snapshot IDs used for visual, interaction, content, or responsive evidence;
- repository snapshot IDs used for implementation or current-state claims;
- documentation snapshot IDs used for authoritative requirements or constraints;
- runtime snapshot IDs used for current-behavior or final-validation claims.

The artifact should reference only sources actually used.

## Active baseline

`WORKFLOW-STATE.md` records the currently active snapshot IDs.

An artifact remains valid against the snapshots listed in its own metadata even after the active project baseline changes. It becomes stale only when a newer baseline affects its scope or conclusions.

## Detecting source changes

Before starting a stage, resuming after a meaningful pause, or declaring final acceptance:

1. compare the available source identity with the active snapshot;
2. determine whether the source changed or cannot be verified;
3. record the check in `WORKFLOW-STATE.md`;
4. do not silently use a newer source under an older snapshot ID.

For mutable Time-bound sources, a new inspection time alone does not require rebasing when the relevant content is demonstrably unchanged. Record the verification method.

## Rebaseline protocol

When a material source changes:

1. create a new snapshot ID;
2. preserve the previous record and mark it Superseded when appropriate;
3. record the reason, detected changes, and effective date;
4. perform an impact assessment across project artifacts;
5. identify the earliest affected workflow stage;
6. move `WORKFLOW-STATE.md` back to that stage when correction is required;
7. update affected artifacts to reference the new snapshot only after reviewing them;
8. preserve stable requirement, design, specification, architecture, plan, and task IDs unless the underlying item is genuinely replaced;
9. record superseded decisions and changed acceptance criteria explicitly;
10. rerun required review and validation gates.

Never edit an existing snapshot ID to point silently to different content.

## Impact assessment

Use a table such as:

| New snapshot | Previous snapshot | Change summary | Affected artifacts | Earliest affected stage | Action | Status |
|---|---|---|---|---:|---|---|
| `SRC-DS-002` | `SRC-DS-001` | ... | `DESIGN-AUDIT.md`, `DESIGN.md`, `SPEC.md` | 1 | Re-audit affected nodes | Open |

A source change does not require rewriting unaffected artifacts. Record why an artifact is unaffected when that conclusion is not obvious.

## Final baseline integrity check

Before final implementation acceptance, verify:

- every referenced snapshot ID exists;
- no artifact depends silently on a newer source;
- the implementation commit is pinned;
- the runtime or preview used for validation is identified;
- source changes during implementation received an impact assessment;
- superseded artifacts or decisions are visible;
- skipped or unavailable captures are documented honestly.

An implementation must not be described as matching “the design” without identifying which design snapshot was used.
