A **`SPEC.md`** file is a **technical specification document** that defines exactly **what a project, feature, page, or component must do**.

It translates design intent into explicit, testable requirements that developers can implement without repeatedly guessing or inspecting the original design.

## Core idea

Think of the documentation flow like this:

* **`DESIGN.md`** — What is the design system and visual intent?
* **`SPEC.md`** — What behavior and requirements must be implemented?
* **`PLAN.md`** — How will we implement those requirements?
* **Code** — The actual implementation.

A good `SPEC.md` describes the required outcome, but generally avoids prescribing every implementation detail.

## What belongs in `SPEC.md`

For a UI project or design-to-code workflow, it commonly covers:

* Scope and objectives
* Component structure
* Content requirements
* Visual states
* Interaction behavior
* Responsive behavior
* Accessibility requirements
* Data and API requirements
* Validation and error handling
* Edge cases
* Acceptance criteria
* Open questions and assumptions

## Recommended structure

```md
# Feature or Component Specification

## 1. Overview

Briefly describe what is being specified and why it exists.

## 2. Goals

- Primary goal
- Secondary goal
- User outcome

## 3. Scope

### Included

- Requirement included in this implementation
- Another included behavior

### Excluded

- Feature intentionally not included
- Future enhancement

## 4. Terminology

Define project-specific terms when necessary.

## 5. Functional Requirements

### FR-001: Requirement name

The system must...

### FR-002: Requirement name

The user must be able to...

## 6. Content Requirements

- Required text
- Optional content
- Character limits
- Empty content behavior
- Localization considerations

## 7. Component Structure

- Parent component
- Child components
- Repeated elements
- Optional regions

## 8. States

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Empty
- Error
- Success

## 9. Interaction Behavior

Describe:

- Click behavior
- Keyboard behavior
- Focus management
- Transitions
- Opening and closing behavior
- Form submission behavior

## 10. Responsive Behavior

### Small screens

Describe layout and behavior.

### Medium screens

Describe layout and behavior.

### Large screens

Describe layout and behavior.

## 11. Accessibility Requirements

- Semantic HTML requirements
- Keyboard navigation
- Focus visibility
- Accessible names
- ARIA requirements
- Contrast expectations
- Reduced-motion behavior
- Screen-reader announcements

## 12. Data Requirements

Describe:

- Required data
- Data shape
- Optional fields
- Default values
- Sorting and filtering
- Persistence requirements

## 13. Validation and Error Handling

- Validation rules
- Inline error behavior
- Server error behavior
- Recovery behavior

## 14. Edge Cases

- Missing content
- Long content
- Slow network
- Duplicate actions
- Unsupported data
- Small viewport
- JavaScript failure

## 15. Non-Functional Requirements

- Performance
- Browser support
- Security
- Maintainability
- SEO
- Analytics

## 16. Acceptance Criteria

- [ ] Requirement can be objectively verified
- [ ] Keyboard users can complete the interaction
- [ ] Layout works at the required viewport sizes
- [ ] Loading, empty, and error states are handled
- [ ] Implementation matches the approved design

## 17. Assumptions

- Assumption one
- Assumption two

## 18. Open Questions

- Question requiring product clarification
- Missing behavior not defined in the design

## 19. References

- Design source
- DESIGN.md
- Related issue
- API documentation
```

## Requirements should be testable

Avoid vague statements such as:

```md
The component should look good on mobile.
```

Prefer measurable requirements:

```md
At viewport widths below 768px, the navigation items must be
hidden behind a menu button.

Activating the button must open the navigation panel and move
keyboard focus to the first interactive item.
```

Another example:

```md
The form should validate the email field.
```

Better:

```md
When the submitted email value is empty or does not use a valid
email format, the form must:

1. Prevent submission.
2. Display an inline error below the field.
3. Associate the error with the input using `aria-describedby`.
4. Move focus to the first invalid field.
```

## Functional requirements and acceptance criteria

These are related but have different purposes.

### Functional requirement

Defines what the system must do:

```md
### FR-004: Expand an FAQ item

The user must be able to expand an FAQ item to reveal its answer.
```

### Acceptance criteria

Defines how you verify that it works:

```md
- [ ] Clicking the question reveals its answer.
- [ ] Pressing Enter or Space while the question has focus reveals it.
- [ ] The trigger exposes its current state through `aria-expanded`.
- [ ] The answer is programmatically associated with its trigger.
```

The most important principle is:

> `SPEC.md` should be detailed enough that implementation can be reviewed against it objectively.

When something cannot be tested, observed, or clearly interpreted, it probably needs to be rewritten or moved to an assumptions or open-questions section.
