# Architecture Template

Use this template to create a project-specific `ARCHITECTURE.md`.

Remove sections that do not apply. Add sections when the project has important architectural concerns not represented here. Do not fill gaps by copying technologies or patterns from examples without repository or project evidence.

# Architecture

## 1. Document Information

- Status: Draft
- Version: 0.1
- Last updated: YYYY-MM-DD
- Owners:
- Scope:
- Related documents:
  - `REQUIREMENTS.md`
  - `DESIGN.md`
  - `SPEC.md`
  - `PLAN.md`

## 2. Purpose

Explain what part of the system this document covers and which structural decisions it protects.

## 3. Evidence and Sources

List the sources used to determine the architecture.

- Repository paths inspected:
- Existing technical documentation:
- Requirement IDs:
- Specification IDs:
- Deployment or infrastructure sources:
- Stakeholder decisions:

Classify important statements as confirmed, observed, inferred, recommended, or open questions.

## 4. Scope and Non-Scope

### Included

- Applications, packages, services, or components covered
- Relevant integrations and infrastructure

### Excluded

- Areas intentionally outside this document
- Future capabilities not currently approved

## 5. System Context

Identify:

- Primary users and actors
- External systems
- Third-party services
- Major inputs and outputs
- Trust boundaries

```text
Actor → System boundary → External dependency
```

## 6. Architectural Goals

List the qualities the architecture is designed to support.

- Maintainability
- Accessibility
- Testability
- Security
- Performance
- Reliability
- Simplicity

Explain project-specific priorities and tradeoffs rather than listing generic qualities only.

## 7. Current Architecture

Describe the relevant architecture that exists in the repository today.

- Applications and packages
- Runtime boundaries
- Important directories or modules
- Existing dependency direction
- Existing constraints and technical debt

Distinguish observed repository facts from inferred intent.

## 8. Target Architecture

Include this section when the implementation will change the current structure.

Describe:

- Proposed system boundaries
- New or changed responsibilities
- Migration path from the current state
- Compatibility requirements
- Transitional architecture, if applicable

Do not present a proposed structure as if it already exists.

## 9. High-Level Structure

Describe the principal parts and how they communicate.

```text
Interface → Application boundary → Data or external boundary
```

## 10. Components and Responsibilities

### Component or subsystem name

**Responsibilities:**

- ...
- ...

**Must not:**

- ...
- ...

**Dependencies:**

- ...

**Owned data or state:**

- ...

Repeat for each architecturally significant component or subsystem.

## 11. Dependency Rules

State allowed and prohibited dependency directions.

1. ...
2. ...
3. ...

Include framework-independence or layer-boundary rules only when supported by the selected architecture.

## 12. Important Data and Interaction Flows

### Flow name

1. Actor or component initiates the operation.
2. ...
3. The operation completes or reports failure.

Document only flows that clarify boundaries, ownership, or important failure behavior.

## 13. State and Data Ownership

Describe:

- Authoritative data sources
- Persistent versus transient state
- Client versus server ownership
- Caching and synchronization
- Validation boundaries
- Concurrency or consistency concerns
- Sensitive-data handling

## 14. Frontend Architecture

When applicable, describe:

- Routing and navigation boundaries
- Feature and shared-component organization
- Component ownership
- Server and interface state
- Data-access boundaries
- Styling and design-system integration
- Rendering strategy
- Error boundaries

## 15. Backend and API Architecture

When applicable, describe:

- Request handling
- Validation
- Business-rule ownership
- Service or use-case boundaries
- API conventions
- Integration boundaries
- Background processing
- Error translation

Detailed endpoint payloads belong in the specification or API documentation.

## 16. Persistence Architecture

When applicable, describe:

- Main entities and relationships
- Persistence ownership
- Transaction boundaries
- Migration strategy
- Retention and deletion behavior
- Repository or data-access boundaries

Avoid duplicating the complete database schema unless it is essential to understanding the architecture.

## 17. Authentication and Authorization

When applicable, describe:

- Identity source
- Authentication flow
- Authorization boundaries
- Session or token lifecycle
- Protected operations
- Logout and revocation behavior
- Security tradeoffs

## 18. Accessibility Architecture

Describe structural decisions needed to preserve accessibility across the system.

- Semantic component boundaries
- Keyboard interaction ownership
- Focus management
- Accessible naming and relationships
- Status and error announcements
- Reduced-motion handling
- Testing responsibilities

Accessibility must be integrated into component and system boundaries rather than deferred as a final enhancement.

## 19. Error Handling and Reliability

Describe:

- Error categories
- Propagation and translation
- User-facing recovery behavior
- Retry and idempotency rules
- Fallback behavior
- Logging and sanitization
- Failure boundaries

## 20. Security and Privacy

Describe relevant:

- Trust boundaries
- Input validation
- Authorization enforcement
- Secret management
- Sensitive-data handling
- Logging restrictions
- Network and origin controls
- Abuse protection
- Privacy constraints

Do not invent policies or controls not supported by requirements or approved decisions.

## 21. Build, Deployment, and Runtime

When applicable, describe:

- Build outputs
- Environments
- Hosting boundaries
- Environment configuration
- Networking
- Deployment ordering
- Database migrations
- Rollback or recovery

## 22. Observability

When applicable, describe:

- Logs
- Metrics
- Traces
- Health checks
- Alerting
- Diagnostic identifiers
- Data that must not be recorded

## 23. Testing Architecture

Define the responsibility of each relevant testing layer.

- Unit tests
- Component tests
- Integration tests
- Contract tests
- End-to-end tests
- Accessibility validation
- Visual validation

## 24. Architectural Decisions

### ADR-001 — Decision title

**Status:** Proposed / Accepted / Superseded

**Context:**

...

**Decision:**

...

**Rationale:**

...

**Alternatives considered:**

- ...

**Tradeoffs and consequences:**

- ...

**Requirement and specification references:**

- ...

Use separate Architecture Decision Records when decisions require independent history or approval.

## 25. Constraints and Tradeoffs

- Constraint or accepted limitation
- Resulting consequence
- Mitigation, when applicable

## 26. Risks

| Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 27. Assumptions and Open Questions

### Assumptions

- ...

### Open questions

- ...

Do not silently convert unresolved questions into architectural decisions.

## 28. Future Evolution

Describe plausible extension points without turning them into current requirements.

- ...

## 29. Traceability

| Architecture item | Requirement or specification | Repository evidence | Validation |
|---|---|---|---|
| ... | ... | ... | ... |

## 30. Architecture Validation

- [ ] Scope and current-state observations are accurate.
- [ ] Proposed architecture is distinguished from existing architecture.
- [ ] Responsibilities and dependency rules are explicit.
- [ ] Important data and state ownership is defined.
- [ ] Accessibility, security, errors, and testing are addressed where relevant.
- [ ] Tradeoffs, risks, assumptions, and open questions are visible.
- [ ] Decisions are traceable to requirements, specifications, or repository evidence.
- [ ] No example technology or pattern was adopted without project evidence.
