# Changelog

All notable changes to this workflow toolkit are documented here.

The format follows Keep a Changelog principles. Version numbers describe toolkit evolution, not project artifacts created with the workflow.

## [Unreleased]

### Added

- Deterministic agent-orchestration protocol with `design-workflow context --json` and `design-workflow stage check --json`.
- Shared executable action-eligibility checks for stage advancement and task start.
- `workflow/Agent-Orchestration.md` as the canonical AI-agent runtime contract.
- Profile-aware stage prompts for Express, Lite, Standard, and Full execution.
- Orchestration regression tests covering Stage 9/10 boundaries, Continuous-documentation stop behavior, profile targets, and architecture-triggered upgrades.
- End-to-end Express quickstart with an explicit automatically-enforced versus human-reviewed responsibility matrix.
- Canonical workflow-state ownership rules for CLI-managed and Markdown-only projects.
- Deterministic generated Markdown views for workflow status, sources, artifacts, and tasks.
- Canonical SHA-256 record digests embedded in generated views.
- `design-workflow sync` and `design-workflow sync --check` commands.
- Automatic generated-view synchronization after every CLI-managed record mutation.
- Stale or missing generated-view detection in CLI and repository validation.
- Focused generated-state tests covering key-order stability, record drift, manual edits, and repair.
- Dependency-free `design-workflow` CLI package and executable entry point.
- CLI commands for project initialization, status, next-action guidance, stage and mode control, source snapshots, artifact creation, task lifecycle, validation, and identifier tracing.
- Profile-aware artifact generation from the toolkit templates.
- Automatic repository commit pinning during CLI initialization.
- Automatic Implementation output snapshots when CLI-managed tasks complete.
- End-to-end CLI integration tests and package-content validation in GitHub Actions.
- Express profile for one narrow implementation result using one `WORKPACK.md` and at most one task.
- Express workpack template, execution prompt, and complete component example.
- Express profile support in source snapshots, identifier ownership, validation rules, intake guidance, and assistant instructions.
- Machine-readable workflow record schema and dependency-free semantic validator.
- Semantic checks for duplicate IDs, broken references, profile requirements, task cycles, output lineage, completion state, and validation evidence.
- Express semantic checks for one-workpack ownership, one-task limits, and profile-upgrade conditions.
- General, invalid, and Express workflow-record fixtures with validator self-tests.
- Profile-organized example entry points.
- Stage-specific prompt library.
- Source adapters for Figma, screenshots, PDFs, existing websites, and mixed-source projects.
- Source authority and validation rule documents.
- Repository structure and Markdown-link validation script.
- GitHub Actions validation workflow.
- Contribution guidance.

### Changed

- Generated next-action guidance now requires Stage 9 advancement before a Ready task can start and explicitly stops Continuous-documentation mode before Stage 10.
- Express workpack rendering now preserves implementation discoveries/deviations as narrative while keeping structured validation and output lineage record-owned.
- Agent instructions now consume canonical orchestration context instead of reinterpreting workflow state from Markdown.
- `WORKFLOW-STATE.md`, `SOURCE-BASELINE.md`, and `TASKS-INDEX.md` templates now separate record-owned mutable state from narrative evidence, decisions, coverage, and history.
- Snapshot creation now uses the same synchronized save path as other CLI mutations.
- CLI status, next-action, and validation commands now detect generated-state drift.
- Repository validation now checks generated views for every discovered workflow record.
- Reorganized normative workflow documents into `workflow/`.
- Reorganized artifact-writing guidance into `guidelines/`.
- Moved source-specific Figma preparation into `source-adapters/`.
- Reorganized examples by Express, Lite, Standard, and Full profiles.
- Extended repository CI to validate schemas, fixtures, generated state, workflow CLI behavior, package contents, and discovered workflow records.
- Updated internal links and assistant instructions for the v2 structure and Express path.

### Removed

- Legacy root-level workflow and guideline paths after migration.

## [0.2.0] — 2026-08-06

### Added

- Stage 0 project context and workflow state.
- Lite, Standard, and Full workflow profiles.
- Global identifier namespaces.
- Source snapshot pinning and implementation-output lineage.
- Core requirements, design, specification, plan, and Lite brief templates.

### Changed

- Integrated accessibility, responsive behavior, state handling, errors, and testing into feature work.
- Clarified architecture-skip handling and interaction-pattern requirements.

## [0.1.0] — 2026-08-05

### Added

- Initial design-to-implementation workflow.
- Requirements, design, specification, architecture, and planning guidelines.
- Audit, review, architecture, task, and implementation-review templates.
- Figma preparation and normalization guidance.
