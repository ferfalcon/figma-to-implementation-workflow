# Source Baseline Template

Use this template during Stage 0 to create `SOURCE-BASELINE.md`. Follow `Source-Snapshots.md`.

Do not replace a snapshot record with newer content. Create a new ID. Use rebaseline impact assessment for changed upstream inputs and lineage tracking for expected implementation outputs.

# Source Baseline

## 1. Document Information

- Status: Draft
- Project:
- Created: YYYY-MM-DD
- Last updated: YYYY-MM-DD
- Owner:
- Related context: `PROJECT-CONTEXT.md`
- Operational state: `WORKFLOW-STATE.md`

## 2. Active Input Baseline and Output Lineage

| Purpose | Active snapshot IDs | Required for current scope | Notes |
|---|---|---|---|
| Design input | `SRC-DS-001` | Yes / No | ... |
| Repository input baseline | `SRC-REPO-001` | Yes / No | ... |
| Documentation input | `SRC-DOC-001` | Yes / No | ... |
| Asset input | `SRC-ASSET-001` | Yes / No | ... |
| Current task start | `SRC-REPO-001` | Yes / No | ... |
| Latest implementation output | `SRC-REPO-002` / None | Yes / No | ... |
| Current validation runtime | `SRC-RUN-001` / None | Yes / No | ... |

Use `None` when a purpose is not applicable. Do not reference an undefined ID.

## 3. Design Source Snapshots

### SRC-DS-001 — Snapshot title

- **Status:** Active / Superseded / Invalid / Unverified
- **Role:** Input baseline / Supporting source / Historical reference
- **Source type:** Figma / Screenshot / Image / PDF / Existing website / Other
- **Purpose:**
- **Canonical reference:**
- **Included scope:**
- **Excluded scope:**
- **Captured or inspected at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable / Versioned / Time-bound / Unverified
- **Version, revision, or checksum:**
- **Captured evidence:**
- **Access and reproduction instructions:**
- **Dependencies:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

For Figma, record file key, page and node IDs, named version when available, library dependencies, and inspection mode.

## 4. Repository Snapshots

### SRC-REPO-001 — Repository input baseline

- **Status:** Active / Superseded / Invalid / Unverified
- **Role:** Input baseline / Task start / Implementation output / Historical reference
- **Repository:**
- **Commit SHA:**
- **Branch at capture:**
- **Relevant application, package, or directory:**
- **Captured at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable
- **Parent implementation snapshot:** None / `SRC-REPO-*`
- **Produced by task:** None / task ID
- **Lockfile, submodule, or workspace state:**
- **Uncommitted changes or patch:** None / reference
- **Access and reproduction instructions:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

A branch without a commit SHA is not a pinned repository snapshot. An approved task output normally creates a new record with role Implementation output; it does not supersede the original input baseline.

## 5. Runtime Snapshots

### SRC-RUN-001 — Runtime snapshot title

- **Status:** Active / Superseded / Invalid / Unverified
- **Role:** Input baseline / Supporting source / Validation runtime / Historical reference
- **Environment:** Production / Preview / Staging / Local / Other
- **URL or entry point:**
- **Deployment or release ID:**
- **Associated repository snapshot:** `SRC-REPO-*` / Unknown
- **Captured at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable / Versioned / Time-bound / Unverified
- **Browser, viewport, and device context:**
- **Authentication, personalization, or feature-flag state:**
- **Test data context:**
- **Captured evidence:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

## 6. Documentation Snapshots

### SRC-DOC-001 — Document title

- **Status:** Active / Superseded / Invalid / Unverified
- **Role:** Input baseline / Supporting source / Historical reference
- **Authority:** Normative / Informative / Historical
- **Path or URL:**
- **Included sections:**
- **Revision, version, date, commit, or checksum:**
- **Captured at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable / Versioned / Time-bound / Unverified
- **Access and reproduction instructions:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

## 7. Asset Snapshots

### SRC-ASSET-001 — Asset or bundle title

- **Status:** Active / Superseded / Invalid / Unverified
- **Role:** Input baseline / Supporting source / Historical reference
- **Type:** Image / Icon / Font / Archive / Other
- **Path or reference:**
- **Included contents:**
- **Format and size:**
- **SHA-256 checksum:**
- **Captured at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable / Versioned / Time-bound / Unverified
- **Licensing or usage constraints:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

## 8. Repository Implementation Lineage

| Snapshot | Role | Parent snapshot | Produced by task | Commit | Validation status | Used as next task start |
|---|---|---|---|---|---|---|
| `SRC-REPO-001` | Input baseline / Task start | None | None | ... | ... | Yes / No |
| `SRC-REPO-002` | Implementation output | `SRC-REPO-001` | `P01-T01` | ... | ... | Yes / No |

Expected implementation outputs belong here and do not require upstream rebaseline rollback.

## 9. Source Verification Log

| Date and time | Snapshot | Verification method | Result classification | Change detected | Action |
|---|---|---|---|---|---|
| ... | ... | Commit comparison / named-version check / visual comparison / checksum / other | Unchanged / Expected output / Unexpected change / Unavailable | Yes / No / Unknown | ... |

Record checks before stages, after meaningful pauses, before tasks, and before final acceptance.

## 10. Upstream Rebaseline and Impact Assessments

| New snapshot | Previous snapshot | Change summary | Affected artifacts | Earliest affected stage | Required action | Status |
|---|---|---|---|---:|---|---|
| ... | ... | ... | ... | ... | ... | Open / In progress / Complete |

Use this table for changed upstream inputs or unexpected concurrent changes, not for approved task output commits.

## 11. Baseline Review

### Pass 1 — Completeness and correctness

- [ ] Every material source has a snapshot record and role.
- [ ] Exact scope and capture time are recorded.
- [ ] Repository snapshots use commit SHAs.
- [ ] Task outputs have parent snapshots and task IDs.
- [ ] Runtime validation snapshots identify their repository output.
- [ ] Mutable sources are not mislabeled as immutable.
- [ ] Available versions, checksums, exports, and deployment IDs are included.
- [ ] Access and reproduction limitations are explicit.

### Pass 2 — Consistency, traceability, source integrity, risks, and uncertainty

- [ ] Active input and output snapshot IDs exist.
- [ ] Identifiers follow `Identifier-Conventions.md`.
- [ ] Expected implementation outputs are distinguished from upstream source changes.
- [ ] Superseded records remain preserved.
- [ ] Rebaseline impact assessments cover unexpected upstream changes.
- [ ] Repository implementation lineage is complete.
- [ ] `PROJECT-CONTEXT.md` and `WORKFLOW-STATE.md` reference compatible active snapshots.
- [ ] No artifact silently relies on undefined or newer source content.
