A `REQUIREMENTS.md` file defines **what a project or feature must accomplish and why it exists**.

It describes the expected outcomes, behaviors, constraints, and quality standards without deciding the detailed implementation.

---

## Main purpose

A good `REQUIREMENTS.md` should help the team answer:

* What problem are we solving?
* Who is affected?
* What must users be able to do?
* What rules must the system follow?
* What quality standards must it meet?
* What is explicitly outside the project?
* How will we know the implementation is acceptable?

It should serve as the **source of truth for project expectations**.

---

# Recommended format

```md
# Project Requirements

## 1. Document Information

- Status: Draft
- Version: 0.1
- Last updated: YYYY-MM-DD
- Owners:
- Related documents:
  - DESIGN.md
  - SPEC.md
  - ARCHITECTURE.md
  - PLAN.md

## 2. Overview

Briefly describe the project or feature.

## 3. Problem Statement

Describe the problem that needs to be solved.

## 4. Goals

- Goal 1
- Goal 2
- Goal 3

## 5. Non-Goals

- What the project will not solve
- Features intentionally excluded
- Future possibilities that are not part of this version

## 6. Users and Stakeholders

### Primary users

Describe the main users.

### Secondary users

Describe other affected users.

### Stakeholders

List business, product, design, technical, or operational stakeholders.

## 7. User Needs

- Users need to...
- Users need to...
- Administrators need to...

## 8. Functional Requirements

### FR-001 — Requirement name

**Description:**  
Describe the required system behavior.

**Priority:** Must / Should / Could

**Rationale:**  
Explain why the requirement exists.

**Acceptance criteria:**

- Given...
- When...
- Then...

### FR-002 — Requirement name

...

## 9. Business Rules

### BR-001 — Rule name

Describe a rule imposed by the business or domain.

## 10. Data Requirements

- Data the system must collect
- Required and optional fields
- Validation rules
- Data relationships
- Retention requirements
- Privacy considerations

## 11. Non-Functional Requirements

### Accessibility

- Keyboard accessibility
- Screen-reader support
- Color contrast
- Reduced-motion behavior

### Performance

- Expected loading times
- Response-time targets
- Supported data volumes

### Security

- Authentication requirements
- Authorization rules
- Input validation
- Sensitive-data handling

### Reliability

- Error recovery
- Availability expectations
- Data consistency

### Compatibility

- Supported browsers
- Supported devices
- Minimum viewport sizes

### Maintainability

- Documentation expectations
- Testing expectations
- Code-quality requirements

## 12. Responsive Requirements

Describe the expected behavior across:

- Small mobile screens
- Large mobile screens
- Tablets
- Desktop screens
- Large desktop screens

## 13. Content Requirements

- Required content
- Empty states
- Error messages
- Loading states
- Localization requirements
- Content ownership

## 14. Constraints

- Technology constraints
- Budget constraints
- Schedule constraints
- Legal constraints
- Platform limitations
- External-service limitations

## 15. Dependencies

- External services
- APIs
- Design files
- Existing systems
- Third-party libraries
- Other teams

## 16. Assumptions

- Assumption 1
- Assumption 2

## 17. Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Example risk | High | Medium | Proposed mitigation |

## 18. Open Questions

- Question requiring a product decision
- Question requiring technical investigation
- Question requiring stakeholder confirmation

## 19. Definition of Done

The project is complete when:

- All must-have requirements are implemented.
- Acceptance criteria pass.
- Accessibility requirements are verified.
- Automated tests pass.
- Documentation is updated.
- No critical defects remain.

## 20. Requirement Traceability

| Requirement | Design reference | Specification | Test coverage | Status |
|---|---|---|---|---|
| FR-001 | Figma frame/node | SPEC section | Test name | Planned |
```

---

# Core requirement categories

## Functional requirements

Functional requirements describe **what the system must do**.

Examples:

```md
### FR-001 — Create an account

A visitor must be able to create an account using an email address
and password.
```

```md
### FR-002 — Update a task

An authenticated user must be able to change a task's title,
description, completion status, and due date.
```

These requirements represent observable capabilities or behavior.

---

## Non-functional requirements

Non-functional requirements describe **how well the system must operate**.

Examples:

```md
### NFR-001 — Keyboard accessibility

All interactive functionality must be operable using only a keyboard.
```

```md
### NFR-002 — Performance

The initial page content should become usable within two seconds under
the defined testing conditions.
```

Typical areas include:

* Accessibility
* Performance
* Security
* Reliability
* Scalability
* Browser compatibility
* Privacy
* Maintainability

---

## Business rules

Business rules describe domain restrictions that must always be respected.

For example:

```md
### BR-001 — Published FAQ requirement

Only FAQs marked as published may appear on the public website.
```

```md
### BR-002 — Account ownership

A user may modify only tasks associated with their own account.
```

A business rule may affect several functional requirements.

---

## Constraints

Constraints are boundaries within which the solution must operate.

For example:

```md
- The frontend must use React 19 and TypeScript.
- The backend must use Fastify.
- Production data must be stored in PostgreSQL.
- The application must support the latest two versions of major browsers.
```

Constraints are not necessarily user-facing behaviors, but they narrow the available solution space.

---

# Writing good requirements

A requirement should be:

* **Specific:** It describes one clear expectation.
* **Testable:** Someone can verify whether it was satisfied.
* **Unambiguous:** It avoids subjective terms without definitions.
* **Necessary:** It contributes to a real goal or constraint.
* **Implementation-neutral:** It avoids prescribing technical details unless they are genuine constraints.
* **Traceable:** It has a stable identifier such as `FR-001`.
* **Prioritized:** Its importance is explicit.

For example, this requirement is too vague:

```md
The application must be fast and easy to use.
```

A better version is:

```md
### NFR-004 — Interaction responsiveness

After a user submits a task update, the interface must provide visible
feedback within 100 milliseconds.

Under normal operating conditions, the server should complete the update
request within 500 milliseconds for at least 95% of requests.
```

The exact numbers should come from actual product expectations rather than being added arbitrarily.

---

# Requirement IDs

Stable identifiers make discussion, testing, and revision easier.

A common convention is:

| Prefix | Meaning                    |
| ------ | -------------------------- |
| `FR`   | Functional requirement     |
| `NFR`  | Non-functional requirement |
| `BR`   | Business rule              |
| `DR`   | Data requirement           |
| `AR`   | Accessibility requirement  |
| `SEC`  | Security requirement       |
| `CON`  | Constraint                 |

Examples:

```text
FR-001
FR-002
NFR-001
AR-001
SEC-001
```

Avoid renumbering existing requirements after they have been referenced elsewhere. New requirements can receive new IDs even when inserted between earlier sections.

---

# Requirements versus acceptance criteria

A **requirement** states the expected capability.

```md
FR-005: A user must be able to archive a note.
```

**Acceptance criteria** describe verifiable scenarios demonstrating that the requirement has been met.

```md
Acceptance criteria:

- Given an active note owned by the authenticated user,
  when the user selects "Archive",
  then the note is removed from the active-notes view.

- The archived note appears in the archived-notes view.

- Archiving the note does not delete its content.

- A user cannot archive another user's note.
```

One requirement can have several acceptance criteria.

---

# In a design-to-code workflow

The design source cannot reveal every product requirement.

It may show:

* Screens
* Components
* Visual states
* Responsive variations
* Prototype interactions

It often does not show:

* Business rules
* Permission rules
* Data retention
* Error recovery
* Security expectations
* Performance targets
* Unsupported scenarios
* Ownership rules
* Backend behavior
* Complete accessibility requirements

Therefore, when creating `REQUIREMENTS.md` from the Design source, observations should be separated from assumptions:

```md
## Confirmed Requirements

Requirements directly supported by the design, existing documentation,
or stakeholder decisions.

## Inferred Requirements

Requirements strongly implied by the design but not explicitly documented.

## Open Questions

Requirements that cannot be determined safely from the available material.
```

This prevents an AI or developer from presenting guesses as confirmed decisions.

---

# A useful concise definition

> `REQUIREMENTS.md` is the authoritative description of the product outcomes, capabilities, rules, constraints, and quality standards that the implementation must satisfy.

For your incremental workflow, it should normally be the foundation against which `DESIGN.md`, `SPEC.md`, `ARCHITECTURE.md`, and `PLAN.md` are reviewed.
