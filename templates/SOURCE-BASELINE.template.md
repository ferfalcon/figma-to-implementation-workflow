# Source Baseline Template

Use this template during Stage 0 to create `SOURCE-BASELINE.md`. Follow `Source-Snapshots.md`.

Do not replace a snapshot record with newer content. Create a new ID and use the rebaseline process.

# Source Baseline

## 1. Document Information

- Status: Draft
- Project:
- Created: YYYY-MM-DD
- Last updated: YYYY-MM-DD
- Owner:
- Related context: `PROJECT-CONTEXT.md`
- Operational state: `WORKFLOW-STATE.md`

## 2. Active Baseline

| Category | Active snapshot IDs | Required for current scope | Notes |
|---|---|---|---|
| Design | `SRC-DS-001` | Yes / No | ... |
| Repository | `SRC-REPO-001` | Yes / No | ... |
| Runtime | `SRC-RUN-001` | Yes / No | ... |
| Documentation | `SRC-DOC-001` | Yes / No | ... |
| Assets | `SRC-ASSET-001` | Yes / No | ... |

Use `None` when a category is not applicable. Do not reference an undefined ID.

## 3. Design Source Snapshots

### SRC-DS-001 — Snapshot title

- **Status:** Active / Superseded / Invalid / Unverified
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

### SRC-REPO-001 — Repository baseline

- **Status:** Active / Superseded / Invalid / Unverified
- **Repository:**
- **Commit SHA:**
- **Branch at capture:**
- **Relevant application, package, or directory:**
- **Captured at:** YYYY-MM-DDTHH:MM:SS±HH:MM
- **Pin strength:** Immutable
- **Lockfile, submodule, or workspace state:**
- **Uncommitted changes or patch:** None / reference
- **Access and reproduction instructions:**
- **Known limitations:**
- **Supersedes:** None / snapshot ID
- **Superseded by:** None / snapshot ID

A branch without a commit SHA is not a pinned repository snapshot.

## 5. Runtime Snapshots

### SRC-RUN-001 — Runtime snapshot title

- **Status:** Active / Superseded / Invalid / Unverified
- **Environment:** Production / Preview / Staging / Local / Other
- **URL or entry point:**
- **Deployment or release ID:**
- **Associated commit:**
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

## 8. Source Verification Log

| Date and time | Snapshot | Verification method | Result | Change detected | Action |
|---|---|---|---|---|---|
| ... | ... | Commit comparison / named-version check / visual comparison / checksum / other | Verified / Changed / Unavailable | Yes / No / Unknown | ... |

Record checks performed before stages, after meaningful pauses, and before final acceptance.

## 9. Rebaseline and Impact Assessments

| New snapshot | Previous snapshot | Change summary | Affected artifacts | Earliest affected stage | Required action | Status |
|---|---|---|---|---:|---|---|
| ... | ... | ... | ... | ... | ... | Open / In progress / Complete |

## 10. Baseline Review

### Pass 1 — Completeness and correctness

- [ ] Every material source has a snapshot record.
- [ ] Exact scope and capture time are recorded.
- [ ] Repository snapshots use commit SHAs.
- [ ] Mutable sources are not mislabeled as immutable.
- [ ] Available versions, checksums, exports, and deployment IDs are included.
- [ ] Access and reproduction limitations are explicit.

### Pass 2 — Consistency, traceability, risks, and uncertainty

- [ ] Active snapshot IDs exist and have Active status.
- [ ] Identifiers follow `Identifier-Conventions.md`.
- [ ] Superseded records remain preserved.
- [ ] Rebaseline impact assessments are complete.
- [ ] `PROJECT-CONTEXT.md` and `WORKFLOW-STATE.md` reference the same active baseline.
- [ ] No project artifact silently relies on an undefined or newer source.
