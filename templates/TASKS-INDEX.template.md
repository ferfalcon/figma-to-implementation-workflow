# Tasks Index Template

Use this template to create a project-specific `TASKS-INDEX.md`. Keep task order, status, dependencies, coverage, snapshot references, and completion criteria synchronized with task files.

Reference only snapshot IDs defined in `SOURCE-BASELINE.md`.

```yaml
---
artifact: TASKS-INDEX
status: Draft
baseline:
  design:
    - SRC-DS-001
  repository:
    - SRC-REPO-001
  runtime: []
  documentation:
    - SRC-DOC-001
  assets: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

# Tasks Index

## 1. Document Information

- Status: Draft
- Version: 0.1
- Last updated: YYYY-MM-DD
- Project:
- Source baseline: `SOURCE-BASELINE.md`
- Source plan:
- Plan review:
- Architecture document, when applicable:

## 2. Scope

### Included

- Implementation work represented by this task set
- Validation and documentation work required for completion

### Excluded

- Deferred or future work
- Work not approved by requirements or plan

## 3. Status Vocabulary

- `Not started`
- `Blocked`
- `In progress`
- `In review`
- `Complete`

## 4. Execution Rules

- Execute only tasks whose prerequisites are satisfied.
- Verify relevant task snapshots before implementation when sources may have changed.
- Do not silently update tasks to newer source content under existing snapshot IDs.
- When a material source changes, pause affected tasks and follow the rebaseline protocol.
- Do not mark a task complete while required validation fails or remains unverified.
- Update this index whenever task status, dependency, scope, coverage, or baseline changes.
- Do not silently add work unsupported by `PLAN.md`.
- Update upstream artifacts when implementation exposes a documentation error.
- Integrate accessibility, responsive behavior, error handling, and tests into feature tasks.

## 5. Phase Summary

| Phase | Objective | Status | Depends on | Parallel work | Completion criteria |
|---|---|---|---|---|---|
| Phase 01 | ... | Not started | None | ... | ... |

## 6. Task Registry

| Task ID | File | Title | Status | Depends on | May run in parallel | Baseline snapshots | Requirement and specification coverage |
|---|---|---|---|---|---|---|---|
| P01-T01 | `Phase-01--Task-01.md` | ... | Not started | None | No | `SRC-DS-001`, `SRC-REPO-001` | ... |

Use zero-padded filenames and stable task IDs.

## 7. Phase Details

For each phase, document objective, entry criteria, ordered tasks, parallelization, and completion criteria.

## 8. Dependency Map

```text
P01-T01 → P01-T02 → P02-T01
                  ↘ P02-T02
```

## 9. Plan Coverage

| `PLAN.md` item | Task or tasks | Coverage status | Notes |
|---|---|---|---|
| ... | ... | Complete / Partial / Missing | ... |

## 10. Requirement and Specification Coverage

| Requirement or specification | Priority | Task or tasks | Validation task | Coverage status |
|---|---|---|---|---|
| ... | Must / Should / Could | ... | ... | Complete / Partial / Missing / N/A |

## 11. Cross-Cutting Coverage

| Concern | Integrated tasks | Final validation | Gap |
|---|---|---|---|
| Source verification and rebaseline | ... | ... | ... |
| Accessibility | ... | ... | ... |
| Responsive behavior | ... | ... | ... |
| Loading, empty, error, and success states | ... | ... | ... |
| Security and privacy | ... | ... | ... |
| Performance | ... | ... | ... |
| Documentation | ... | ... | ... |
| Regression protection | ... | ... | ... |

## 12. Blocked Tasks

| Task | Blocker | Decision owner | Required action | Impact |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 13. Source-change Log

| Date | Changed snapshot | Affected tasks | Action | Status |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 14. Overall Completion Criteria

- [ ] Every task is complete.
- [ ] Every task's required validation passed.
- [ ] Every must-have requirement and material specification is covered.
- [ ] Task snapshot references remain valid or were rebased and reviewed.
- [ ] Documentation changes discovered during implementation were propagated.
- [ ] No critical or high-severity blocker remains.
- [ ] Final implementation validation is ready to begin.

## 15. Index Validation

### Review pass 1 — Completeness and correctness

- [ ] Every plan item maps to at least one task.
- [ ] Every task has one coherent, independently verifiable result.
- [ ] Dependencies point to valid tasks.
- [ ] Task filenames and IDs are consistent and zero-padded.
- [ ] Snapshot IDs exist and are assigned to affected tasks.

### Review pass 2 — Consistency, traceability, source integrity, risks, and uncertainty

- [ ] Index statuses match task files.
- [ ] Requirement and specification references are valid.
- [ ] Task baselines match the approved plan or document justified rebaselines.
- [ ] Parallel tasks do not modify overlapping responsibilities without coordination.
- [ ] Cross-cutting concerns are not deferred entirely to final cleanup.
- [ ] Blockers and unresolved decisions are visible.
- [ ] No task introduces unsupported scope or silently newer source content.
