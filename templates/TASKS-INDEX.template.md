# Tasks Index Template

Use this template to create a project-specific `TASKS-INDEX.md`.

The index is the authoritative execution map for implementation tasks. Keep task order, status, dependencies, coverage, and completion criteria synchronized with the individual task files.

# Tasks Index

## 1. Document Information

- Status: Draft
- Version: 0.1
- Last updated: YYYY-MM-DD
- Project:
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

Use one consistent status vocabulary across this index and every task file.

Suggested statuses:

- `Not started`
- `Blocked`
- `In progress`
- `In review`
- `Complete`

Record project-specific alternatives here before using them.

## 4. Execution Rules

- Execute only tasks whose prerequisites are satisfied.
- Do not mark a task complete while required validation fails.
- Update this index whenever a task status, dependency, scope, or coverage reference changes.
- Do not silently add work that is unsupported by `PLAN.md`.
- Update upstream documents when implementation exposes a documentation error.
- Integrate accessibility, responsive behavior, error handling, and relevant tests into feature tasks instead of deferring all of them to final cleanup.

## 5. Phase Summary

| Phase | Objective | Status | Depends on | Parallel work | Completion criteria |
|---|---|---|---|---|---|
| Phase 01 | ... | Not started | None | ... | ... |

## 6. Task Registry

| Task ID | File | Title | Status | Depends on | May run in parallel | Requirement coverage | Specification coverage |
|---|---|---|---|---|---|---|---|
| P01-T01 | `Phase-01--Task-01.md` | ... | Not started | None | No | ... | ... |

Use zero-padded filenames and stable task IDs.

## 7. Phase Details

### Phase 01 — Phase title

**Objective**

Describe the meaningful project result this phase produces.

**Entry criteria**

- ...

**Tasks**

| Order | Task | Result | Dependencies | Status |
|---:|---|---|---|---|
| 1 | [`Phase-01--Task-01.md`](Phase-01--Task-01.md) | ... | None | Not started |

**Parallelization**

Describe which tasks may run in parallel and why their files, responsibilities, and dependencies do not conflict.

**Phase completion criteria**

- [ ] ...
- [ ] ...

Repeat for each phase.

## 8. Dependency Map

```text
P01-T01 → P01-T02 → P02-T01
                  ↘ P02-T02
```

Keep this representation consistent with the task registry.

## 9. Plan Coverage

| `PLAN.md` item | Task or tasks | Coverage status | Notes |
|---|---|---|---|
| ... | ... | Complete / Partial / Missing | ... |

Every material plan item must appear in at least one task.

## 10. Requirement and Specification Coverage

| Requirement or specification | Priority | Task or tasks | Validation task | Coverage status |
|---|---|---|---|---|
| ... | Must / Should / Could | ... | ... | Complete / Partial / Missing / N/A |

Every must-have requirement and material specification must be covered.

## 11. Cross-Cutting Coverage

| Concern | Integrated tasks | Final validation | Gap |
|---|---|---|---|
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

## 13. Overall Completion Criteria

- [ ] Every task is complete.
- [ ] Every task's required validation passed.
- [ ] Every must-have requirement and material specification is covered.
- [ ] Documentation changes discovered during implementation were propagated.
- [ ] No critical or high-severity blocker remains.
- [ ] Final implementation validation is ready to begin.

## 14. Index Validation

### Review pass 1 — Completeness and correctness

- [ ] Every plan item maps to at least one task.
- [ ] Every task has one coherent, independently verifiable result.
- [ ] Dependencies point only to existing earlier tasks.
- [ ] Task filenames and IDs are consistent and zero-padded.
- [ ] Phase and overall completion criteria are objective.

### Review pass 2 — Consistency, traceability, risks, and uncertainty

- [ ] Index statuses match individual task files.
- [ ] Requirement and specification references are valid.
- [ ] Parallel tasks do not modify overlapping responsibilities without coordination.
- [ ] Cross-cutting concerns are not deferred entirely to final cleanup.
- [ ] Blockers and unresolved decisions are visible.
- [ ] No task introduces unsupported scope.
