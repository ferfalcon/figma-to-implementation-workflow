# Changelog

All notable changes to this workflow toolkit are documented here.

The format follows Keep a Changelog principles. Version numbers describe toolkit evolution, not project artifacts created with the workflow.

## [Unreleased]

### Added

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

- Reorganized normative workflow documents into `workflow/`.
- Reorganized artifact-writing guidance into `guidelines/`.
- Moved source-specific Figma preparation into `source-adapters/`.
- Reorganized examples by Express, Lite, Standard, and Full profiles.
- Extended repository CI to validate schemas, fixtures, Express resources, and discovered workflow records.
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
