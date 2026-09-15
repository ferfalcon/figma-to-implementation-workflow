# Toolkit Distribution

This document owns how a validated workflow toolkit revision becomes a stable version that other repositories can pin.

It does **not** define application starter publication, product acceptance, or consumer bootstrap behavior. Those remain separate concerns.

## Channels

The toolkit has two distribution channels:

- `main` is the **development channel**. It contains the latest merged toolkit work and may move at any time.
- A non-draft, non-prerelease **GitHub Release** created by the canonical release workflow is the **stable channel**.

A stable release uses tag `v<package-version>`. The tag must resolve to the exact commit that passed the release workflow validation. Consumers and automation that use a stable release must resolve that tag to its exact commit SHA before executing toolkit code; the mutable channel name or tag is not the runtime identity.

## Stable release invariants

A stable toolkit release is valid only when all of the following are true:

1. The release workflow was dispatched from `main`.
2. The requested version exactly matches `package.json`.
3. The version is a stable `MAJOR.MINOR.PATCH` version, not a prerelease.
4. `CHANGELOG.md` contains a dated heading for that version.
5. The `## [Unreleased]` section is empty, so no merged work is silently omitted from the released version.
6. The full repository validation contract passes on Node.js 22 and 24.
7. `npm pack --dry-run` succeeds on Node.js 22 and 24 and packaging leaves no repository drift.
8. Neither the version tag nor a GitHub Release with that tag already exists.
9. The release is created against the exact validated `GITHUB_SHA` and the resulting tag resolves back to that commit.

The release workflow never moves or reuses an existing version tag. Fixes after a release require a new version.

For stronger repository-level supply-chain protection, maintainers should enable GitHub **immutable releases** before publishing the first stable toolkit release. GitHub's immutable-release setting locks the release's associated tag after publication. The Actions `GITHUB_TOKEN` does not have repository-administration permission, so the release workflow does not attempt to inspect or change that repository setting and does not require a separate administrator token.

## Canonical release workflow

The only repository-owned stable-release path is `.github/workflows/release-toolkit.yml`.

The workflow is manually dispatched and requires the intended package version as an explicit input. It performs release metadata preflight, runs the repository validation matrix, verifies package generation, then creates the stable GitHub Release only after every validation job succeeds.

External GitHub Actions used by this write-capable workflow are pinned to full commit SHAs. The release job receives only `contents: write`; validation jobs remain read-only.

## Preparing a version

Before running the release workflow:

1. Decide the next toolkit version.
2. Move the completed entries from `## [Unreleased]` into a dated `## [x.y.z] — YYYY-MM-DD` section.
3. Leave `## [Unreleased]` empty for new work after the release.
4. Update `package.json` and `package-lock.json` to the same version.
5. Prefer enabling **immutable releases** in the repository's GitHub Releases settings before the first stable publication.
6. Merge the release-preparation changes to `main` and make sure normal repository CI is green.
7. Manually dispatch **Release stable toolkit** from `main`, entering that exact version without a leading `v`.

The release workflow fails closed when the repository is not in this state.

## What a toolkit release publishes

A toolkit release publishes release metadata and a version tag only. The repository at the release commit is the distributable toolkit source.

It does **not** publish:

- an Astro application ZIP;
- a companion starter/template repository;
- a generated consumer bundle as a release asset;
- product-acceptance evidence;
- deployment artifacts.

The maintained Astro scaffold remains an implementation-adapter concern. Product acceptance remains maintainer QA. Neither is coupled to stable toolkit publication.

## Product acceptance is separate

Repository CI answers whether the toolkit revision satisfies its engineering contracts. A stable GitHub Release answers which validated toolkit revision is available through the stable channel. Real ordinary-ChatGPT product acceptance answers whether that released product experience works end to end.

These signals are intentionally separate. Product acceptance may attest to a released revision after publication, but the release workflow does not read private acceptance evidence or publish only after a product-acceptance gate.

## Bootstrap boundary

This contract establishes the stable distribution channel. It does not by itself change `Project-settings--Instructions.md` or existing consumer repositories.

A separate bootstrap change may resolve the latest stable GitHub Release and pin its exact commit SHA for new consumers. Existing repositories with an exact toolkit pin remain bound to that revision until intentionally upgraded.

## Failure and recovery

If validation fails, correct the repository and dispatch the workflow again after merging the fix.

If a release attempt fails before GitHub creates the tag/release, it is safe to retry after correcting the cause. If the version tag or release already exists, the workflow fails rather than mutating it; inspect the existing release and prepare a new version if changes are required.
