# Identifier Conventions

Stable, globally distinct identifiers make sources, evidence, decisions, tasks, and validation traceable without ambiguity.

Use the following namespaces throughout project artifacts.

## Identifier namespaces

| Prefix | Owner | Purpose |
|---|---|---|
| `SRC-DS-*` | `SOURCE-BASELINE.md` | Design-source snapshots |
| `SRC-REPO-*` | `SOURCE-BASELINE.md` | Repository and code snapshots |
| `SRC-RUN-*` | `SOURCE-BASELINE.md` | Runtime and deployment snapshots |
| `SRC-DOC-*` | `SOURCE-BASELINE.md` | Authoritative or supporting documentation snapshots |
| `SRC-ASSET-*` | `SOURCE-BASELINE.md` | Asset and implementation-input snapshots |
| `EVD-*` | `DESIGN-AUDIT.md` | Evidence observed within pinned sources |
| `AUD-*` | `DESIGN-AUDIT.md` | Audit findings |
| `REQ-FR-*` | `REQUIREMENTS.md` | Functional requirements |
| `REQ-BR-*` | `REQUIREMENTS.md` | Business rules |
| `REQ-DR-*` | `REQUIREMENTS.md` | Data requirements |
| `REQ-NFR-*` | `REQUIREMENTS.md` | Non-functional requirements |
| `REQ-AR-*` | `REQUIREMENTS.md` | Accessibility requirements |
| `REQ-SEC-*` | `REQUIREMENTS.md` | Security requirements |
| `REQ-CON-*` | `REQUIREMENTS.md` | Constraints |
| `DES-*` | `DESIGN.md` | General design decisions |
| `DES-RWD-*` | `DESIGN.md` | Responsive design decisions |
| `DES-INT-*` | `DESIGN.md` | Interaction-design decisions |
| `SPEC-BEH-*` | `SPEC.md` | Behavioral specifications |
| `SPEC-INT-*` | `SPEC.md` | Interaction specifications |
| `SPEC-VAL-*` | `SPEC.md` | Validation and error specifications |
| `SPEC-ACC-*` | `SPEC.md` | Accessibility specifications |
| `SPEC-DATA-*` | `SPEC.md` | Data and interface specifications |
| `AC-*` | `SPEC.md` or requirement acceptance criteria | Acceptance criteria |
| `ADR-*` | `ARCHITECTURE.md` or ADR files | Architecture decisions |
| `PLAN-*` | `PLAN.md` | Material plan items |
| `P01-T01` | `TASKS-INDEX.md` and task files | Implementation tasks |
| `DOC-*` | `DOCUMENT-REVIEW.md` | Documentation-review findings |
| `PLANREV-*` | `PLAN-REVIEW.md` | Plan-review findings |
| `IMPL-*` | `IMPLEMENTATION-REVIEW.md` | Implementation-review findings |

Use zero-padded numeric suffixes, such as `SRC-DS-001`, `REQ-FR-001`, `SPEC-ACC-004`, and `PLAN-012`.

## Snapshot ownership rules

- Every `SRC-*` identifier is created and defined in `SOURCE-BASELINE.md`.
- A snapshot ID identifies one specific source revision or one explicitly time-bound observation.
- Never edit an existing snapshot ID so that it points to different content.
- When a source changes materially, create a new snapshot ID and use the rebaseline protocol in `Source-Snapshots.md`.
- Evidence IDs reference the snapshot in which the evidence was observed; they do not replace the snapshot ID.

Example:

```md
- `EVD-012` was observed in `SRC-DS-003`, Figma node `41:22`.
- Repository claim supported by `SRC-REPO-002` at commit `abc123...`.
```

## General ownership rules

- Each identifier is created and defined in exactly one owning artifact.
- Other documents reference the identifier; they do not redefine it.
- A specification must not reuse a requirement identifier as its own identifier.
- A finding identifier records the review finding, not the source item that caused it.
- A task identifier must remain synchronized between `TASKS-INDEX.md` and its task file.

## Stability rules

- Never renumber an identifier after another artifact references it.
- Never reuse an identifier that was deleted, rejected, superseded, or invalidated.
- When an item changes, update it in place and record the change where history matters.
- When an item is superseded, preserve the old identifier and point to the replacement.
- Add new identifiers at the end of the relevant namespace even when the content is inserted earlier in the document.

Snapshot records are stricter: identity fields describing the captured source must remain immutable. Correct factual recording errors explicitly; do not use a correction to disguise a source change.

## Lite profile

`IMPLEMENTATION-BRIEF.md` may contain several ownership sections, but it must still use the normal namespaces:

- requirement section → `REQ-*`;
- design section → `DES-*`;
- specification section → `SPEC-*` and `AC-*`;
- implementation-plan section → `PLAN-*`.

It references source snapshots from `SOURCE-BASELINE.md` like every other artifact.

Consolidating files does not merge identifier responsibilities.

## References

Use complete identifiers.

Good:

```md
- Baseline: `SRC-DS-001`, `SRC-REPO-001`.
- Implements `SPEC-INT-003` and satisfies `AC-007`.
- Supported by `EVD-012` and `REQ-AR-004`.
```

Avoid:

```md
- Uses the latest design.
- Implements interaction 3.
- Covers FR-004.
```

## Migration from older documents

Existing project artifacts using shorter identifiers such as `FR-001` may keep them to avoid breaking established references.

For new projects, use the global namespaces in this document.

When actively revising an unimplemented draft set:

1. migrate identifiers consistently across all artifacts;
2. update every reference in the same change;
3. record the migration in `WORKFLOW-STATE.md`;
4. verify that no old or duplicate reference remains.

Do not partially migrate a connected artifact set.
