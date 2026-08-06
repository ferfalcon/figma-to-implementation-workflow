# Identifier Conventions

Stable, globally distinct identifiers make evidence, decisions, tasks, and validation traceable without ambiguity.

Use the following namespaces throughout project artifacts.

## Identifier namespaces

| Prefix | Owner | Purpose |
|---|---|---|
| `EVD-*` | `DESIGN-AUDIT.md` | Design-source or repository evidence |
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

Use zero-padded numeric suffixes, such as `REQ-FR-001`, `SPEC-ACC-004`, and `PLAN-012`.

## Ownership rules

- Each identifier is created and defined in exactly one owning artifact.
- Other documents reference the identifier; they do not redefine it.
- A specification must not reuse a requirement identifier as its own identifier.
- A finding identifier records the review finding, not the source item that caused it.
- A task identifier must remain synchronized between `TASKS-INDEX.md` and its task file.

## Stability rules

- Never renumber an identifier after another artifact references it.
- Never reuse an identifier that was deleted, rejected, or superseded.
- When an item changes, update it in place and record the change where history matters.
- When an item is superseded, preserve the old identifier and point to the replacement.
- Add new identifiers at the end of the relevant namespace even when the content is inserted earlier in the document.

## Lite profile

`IMPLEMENTATION-BRIEF.md` may contain several ownership sections, but it must still use the normal namespaces:

- requirement section → `REQ-*`;
- design section → `DES-*`;
- specification section → `SPEC-*` and `AC-*`;
- implementation-plan section → `PLAN-*`.

Consolidating files does not merge identifier responsibilities.

## References

Use the complete identifier when referring to an item.

Good:

```md
- Implements `SPEC-INT-003` and satisfies `AC-007`.
- Supported by `EVD-012` and `REQ-AR-004`.
```

Avoid:

```md
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
