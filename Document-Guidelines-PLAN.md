A `PLAN.md` file is a **human-readable implementation plan stored in Markdown**.

It describes **how a project, feature, component, or change will be built** before the actual implementation begins.

In a spec-driven workflow, the documents usually play these roles:

```text
DESIGN.md → What the experience and interface should be
SPEC.md   → What the system must do
PLAN.md   → How the team will implement it
Code      → The implementation itself
```

## Main purpose

A good `PLAN.md` converts requirements into an ordered sequence of implementation tasks.

It should answer questions such as:

* What needs to be created or modified?
* In what order should the work happen?
* Which files, components, modules, or services are involved?
* What dependencies exist between tasks?
* Which technical decisions must be made?
* How will each step be tested?
* What risks or uncertainties could affect the implementation?
* When is the implementation considered complete?

The plan should be detailed enough that another developer—or an AI coding agent—can implement the feature without inventing major requirements.

## What `PLAN.md` is not

A `PLAN.md` should not simply repeat the specification.

For example:

```markdown
## Requirement

The navigation must collapse on mobile.
```

That belongs mainly in `SPEC.md`.

The implementation plan should translate it into technical work:

```markdown
## Mobile navigation implementation

1. Create a `MobileMenuButton` component.
2. Store the menu state in the navigation component.
3. Hide desktop navigation below the defined breakpoint.
4. Add `aria-expanded` and `aria-controls` to the trigger.
5. Move focus into the menu when it opens.
6. Return focus to the trigger when it closes.
7. Close the menu when Escape is pressed.
8. Add keyboard and responsive behavior tests.
```

## Recommended structure

```markdown
# Implementation Plan

## 1. Overview

Briefly explain what will be implemented and why.

## 2. Source Documents

List the materials used to create the plan:

- Design source
- DESIGN.md
- SPEC.md
- Existing repository
- API documentation
- Design-system documentation

## 3. Current State

Describe the relevant existing implementation:

- Existing components
- Current architecture
- Reusable utilities
- Known limitations
- Technical debt that affects the work

## 4. Scope

### Included

- Features and behaviors covered by the implementation

### Excluded

- Work intentionally deferred or outside this change

## 5. Technical Approach

Explain the proposed implementation strategy:

- Component architecture
- Data flow
- State management
- API integration
- Styling approach
- Responsive strategy
- Accessibility strategy
- Testing strategy

## 6. Files and Modules

| File or module | Action | Responsibility |
|---|---|---|
| `Header.tsx` | Modify | Coordinate navigation behavior |
| `MobileMenu.tsx` | Create | Render mobile navigation |
| `header.css` | Modify | Add responsive styles |
| `Header.test.tsx` | Create | Test interaction and accessibility |

## 7. Implementation Phases

### Phase 1 — Foundation

- [ ] Define shared types
- [ ] Add required design tokens
- [ ] Create the base component structure

### Phase 2 — Core behavior

- [ ] Implement state and interactions
- [ ] Connect data or API services
- [ ] Handle loading and error states

### Phase 3 — Responsive behavior

- [ ] Implement mobile layout
- [ ] Implement tablet behavior
- [ ] Verify desktop behavior

### Phase 4 — Accessibility

- [ ] Add semantic HTML
- [ ] Add accessible names and relationships
- [ ] Implement keyboard interaction
- [ ] Verify focus management
- [ ] Test reduced-motion behavior

### Phase 5 — Validation

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Perform visual comparison
- [ ] Test supported viewport sizes
- [ ] Run linting and type checking

## 8. Dependencies and Ordering

Explain which tasks must happen before others.

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Design uses an unavailable font | Visual mismatch | Define an approved fallback |
| API response is unclear | Incorrect data handling | Confirm or document the schema |
| Mobile interaction is unspecified | Inconsistent implementation | Record the selected assumption |

## 10. Open Questions

- Questions that must be answered before or during implementation
- Missing design states
- Unclear API behavior
- Decisions that require stakeholder approval

## 11. Definition of Done

- [ ] All acceptance criteria pass
- [ ] Responsive behavior matches the specification
- [ ] Keyboard navigation works
- [ ] Accessibility checks pass
- [ ] Tests pass
- [ ] No linting or type errors remain
- [ ] Documentation is updated
```

## Characteristics of a strong plan

### Ordered

Tasks appear in a logical implementation sequence.

```text
Types → data layer → business logic → UI → integration → testing
```

### Concrete

Weak:

```markdown
- Build the component.
- Make it responsive.
- Add accessibility.
```

Strong:

```markdown
- Create the `Footer` component shell using semantic `<footer>` markup.
- Render navigation groups from typed configuration data.
- Switch from a four-column grid to stacked accordions below 768px.
- Connect each accordion trigger to its panel using `aria-controls`.
- Preserve all links in the DOM when JavaScript is unavailable.
```

### Traceable

Major tasks should connect back to a design decision, requirement, or acceptance criterion.

Example:

```markdown
- Implement Escape-key handling.
  - Source: `SPEC.md`, Accessibility Requirements, AC-07.
```

### Testable

Every important implementation task should have a validation method.

```markdown
- Implement the loading state.
- Verify that the submit button is disabled while the request is pending.
- Add a test confirming that duplicate requests cannot be submitted.
```

### Honest about uncertainty

A plan should clearly distinguish between:

* confirmed requirements;
* implementation decisions;
* assumptions;
* unresolved questions.

It should not silently convert guesses into requirements.

## Different levels of `PLAN.md`

### Project-level plan

Covers the complete application:

```text
Repository setup
Architecture
Authentication
Database
API
Frontend
Testing
Deployment
Monitoring
```

### Feature-level plan

Covers one feature:

```text
User authentication
FAQ management
Search
Checkout
Notifications
```

### Component-level plan

Covers one UI component:

```text
Structure
Variants
Props
States
Responsive behavior
Accessibility
Styling
Tests
Integration
```
