# Maintained Astro runtime scaffold

This directory owns the exact Astro + TypeScript scaffold resource used by both toolkit validation and the Stage-10 runtime scaffold command.

- `application/` contains the application files copied into `repository.implementationRoot`.
- `repository/` contains repository-level integration templates rendered against that implementation root.

The runtime package includes those two resource directories so a toolkit pinned to an exact revision materializes the same bytes that toolkit CI validates. This README is maintainer guidance and is intentionally source-only.

Do not add project-specific implementation requirements here. The scaffold is only the maintained baseline; approved design work replaces the sample content during Stage 10.
