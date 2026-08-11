# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free Node.js CLI and documentation toolkit. Put normative rules in `workflow/`, source inspection guidance in `source-adapters/`, writing guidance in `guidelines/`, reusable documents in `templates/`, and stage instructions in `prompts/`. CLI code lives in `cli/` and `cli/lib/`; schemas, repository checks, fixtures, and non-normative samples live in `schemas/`, `scripts/`, `tests/fixtures/`, and `examples/` respectively.

## WSL and Node Environment

Develop inside WSL from the Linux checkout under `/home/fer/`; do not run Windows `node.exe` or `npm.cmd` against it. Confirm the session before working:

```bash
uname -a
printf '%s\n' "$WSL_DISTRO_NAME"
```

The package requires Node.js 22 or newer. NVM is a shell function, so check it with `type nvm`, not only `which nvm`. If a non-interactive shell has not loaded NVM, run:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
node --version
```

If `/bin/bash` is unavailable or the WSL variables are empty, fix the WSL task/session instead of falling back to the Windows runtime.

## Build, Test, and Development Commands

There is no compilation step or runtime dependency installation.

- `node cli/design-workflow.mjs help` runs the CLI locally.
- `npm run validate` runs all repository, record, generated-state, and CLI checks.
- `npm run test:records`, `npm run test:state`, and `npm run test:cli` run focused suites.

Run the full validator before submitting structural, schema, template, prompt, or CLI changes.

## Coding Style & Naming Conventions

Use ESM `.mjs`, two-space indentation, semicolons, single quotes, and descriptive `camelCase`. Keep the CLI dependency-free unless maintainers approve otherwise. Follow existing names such as `SOURCE-BASELINE.md`, `prompts/04-specification.md`, and `*.template.md`. Preserve identifiers like `SRC-DS-001`, `REQ-FR-001`, and `P01-T01`. Use relative Markdown links.

## Testing Guidelines

Add focused `scripts/test-*.mjs` coverage and update `tests/fixtures/` for semantic changes. Test accepted and rejected states. No numeric coverage target exists; new failure modes and the complete validator must pass.

## Commit & Pull Request Guidelines

Use short, imperative, sentence-case subjects, for example `Handle malformed records during state validation`. Keep commits narrowly scoped. Pull requests must explain the change, repository area, affected profiles or artifacts, compatibility impact, validation, and remaining risks. Review first for correctness, then for consistency and traceability. Add screenshots only for rendered or visual changes.

## Canonical State Rules

In CLI-managed projects, `.workflow/workflow-record.json` owns mutable state. Never hand-edit `.workflow/generated/`. After direct record changes, run `design-workflow sync` and `design-workflow sync --check`; commit the record and generated views together.
