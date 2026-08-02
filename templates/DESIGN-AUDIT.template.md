# Design Audit Template

Use this template to create a project-specific `DESIGN-AUDIT.md`.

The audit is an evidence baseline. Record what the design source demonstrates, where the evidence appears, and what remains uncertain. Do not convert observations into product requirements or implementation decisions.

Remove sections that do not apply. Add source-specific sections when needed.

# Design Audit

## 1. Document Information

- Status: Draft
- Version: 0.1
- Last updated: YYYY-MM-DD
- Auditor:
- Project:
- Design source:
- Repository, when available:
- Related documents:
  - `REQUIREMENTS.md`
  - `DESIGN.md`
  - `SPEC.md`

## 2. Audit Purpose

Explain:

- why the design source is being audited;
- which later documents will depend on this evidence;
- what the audit does not decide.

## 3. Scope

### Included

- Pages, screens, sections, frames, flows, or equivalent source regions
- Viewports and responsive variants
- Components and reusable patterns
- States and interactions
- Assets, content, and design tokens

### Excluded

- Source areas intentionally outside this audit
- Product behavior not demonstrated by the source
- Technical implementation decisions

## 4. Source Inventory

| Source item | Type | Identifier or location | Purpose | Included |
|---|---|---|---|---|
| ... | Figma page / image / PDF page / URL / other | ... | ... | Yes / No |

For Figma sources, include page, frame, component, and node identifiers when available. For other formats, use the most precise location reference available.

## 5. Evidence Classification

Use these labels consistently:

- **Confirmed:** established by authoritative documentation or a user decision.
- **Observed:** directly visible in the design source.
- **Inferred:** strongly suggested but not demonstrated.
- **Recommended:** proposed to resolve a gap.
- **Open question:** cannot be determined safely.

Do not classify inferred behavior as observed or confirmed.

## 6. Screen and Flow Inventory

| ID | Screen, page, or state | Source reference | Entry point | Primary purpose | Connected destination |
|---|---|---|---|---|---|
| DS-001 | ... | ... | ... | ... | ... |

Describe incomplete, disconnected, or ambiguous paths below the table.

## 7. Information Architecture and Content Hierarchy

Document observed:

- navigation structure;
- reading order;
- page and section hierarchy;
- primary and secondary actions;
- repeated content groups;
- labels, headings, and content relationships.

Reference the supporting source region for each material observation.

## 8. Layout and Responsive Evidence

### Viewport inventory

| Source reference | Approximate viewport | Layout mode | Important behavior |
|---|---:|---|---|
| ... | ... | Fixed / Fluid / Unknown | ... |

### Observed transformations

Document what visibly wraps, stacks, reorders, hides, changes size, changes alignment, or changes interaction pattern.

### Missing responsive evidence

Record behavior that is not shown between or beyond supplied viewports.

## 9. Visual System Inventory

### Typography

| Role | Observed value or style | Source reference | Notes |
|---|---|---|---|
| ... | ... | ... | ... |

### Color

| Semantic role | Observed value or token | Source reference | Notes |
|---|---|---|---|
| ... | ... | ... | ... |

### Spacing, sizing, and layout tokens

| Pattern or token | Observed value | Source reference | Consistency |
|---|---|---|---|
| ... | ... | ... | Consistent / Inconsistent / Unknown |

Document relevant borders, radii, shadows, imagery, iconography, grids, and container behavior.

## 10. Component and Pattern Inventory

| Component or pattern | Variants | States | Reuse evidence | Source references | Notes |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

Identify detached, duplicated, inconsistent, or one-off patterns.

## 11. State Coverage

| Element or flow | Default | Hover | Focus | Active | Selected | Disabled | Loading | Empty | Error | Success |
|---|---|---|---|---|---|---|---|---|---|---|
| ... | Seen / Missing / N/A | ... | ... | ... | ... | ... | ... | ... | ... | ... |

Describe states whose visual presence does not establish complete behavior.

## 12. Interaction and Motion Evidence

| Interaction | Trigger | Observed result | Motion or timing | Source reference | Certainty |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | Observed / Inferred |

Include prototype connections or equivalent interaction evidence when available.

## 13. Content and Data Patterns

Document observed:

- repeated data structures;
- optional and required-looking content;
- text-length patterns;
- image and media ratios;
- labels and validation messages;
- empty, missing, or placeholder content;
- localization or formatting evidence.

Do not infer database or API behavior from visual repetition alone.

## 14. Assets and Source Dependencies

| Asset | Source reference | Format | Intended use | Availability | Export or licensing concern |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Available / Missing / Unknown | ... |

## 15. Accessibility Observations

Record evidence and concerns related to:

- semantic hierarchy implied by the composition;
- reading and focus order;
- visible focus states;
- keyboard-operable interaction patterns;
- color contrast;
- touch-target size;
- text resizing and reflow;
- reduced motion;
- alternative text needs;
- status and error communication.

The design source may suggest accessibility intent but does not prove implementation compliance.

## 16. Inconsistencies and Missing Evidence

| Finding ID | Category | Finding | Source reference | Impact | Classification |
|---|---|---|---|---|---|
| AUD-001 | Visual / Responsive / State / Content / Accessibility / Flow | ... | ... | ... | Observed / Inferred |

## 17. Questions

### Product questions

- ...

### Design questions

- ...

### Content questions

- ...

### Technical questions

- ...

Each question should explain why the evidence is insufficient and whether it blocks later stages.

## 18. Assumptions and Recommendations

### Inferred

- ...

### Recommended

- ...

Keep these separate from factual audit findings.

## 19. Evidence Index

| Evidence ID | Source reference | Summary | Used by |
|---|---|---|---|
| EVD-001 | ... | ... | Requirement, design, or specification reference |

## 20. Audit Review

### Review pass 1 — Completeness and correctness

- [ ] The full agreed design-source scope was inspected.
- [ ] Material screens, flows, components, states, and viewports are inventoried.
- [ ] Important observations include precise source references.
- [ ] Missing evidence and inconsistencies are recorded.
- [ ] Accessibility implications are included.

### Review pass 2 — Consistency, traceability, and uncertainty

- [ ] Confirmed, observed, inferred, recommended, and open information remain distinct.
- [ ] No product rule or implementation decision was invented.
- [ ] Evidence identifiers and source references are internally consistent.
- [ ] Questions are categorized and blocking status is clear.
- [ ] The audit is suitable as the factual baseline for later documents.

## 21. Completion Summary

- Files created or modified:
- Important findings:
- Assumptions introduced:
- Open questions or blockers:
- Ready for requirements: Yes / No
