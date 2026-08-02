# `ARCHITECTURE.md` Documentation Guidelines

An `ARCHITECTURE.md` file explains **how a software system is organized and why its structural decisions were made**.

It should let a developer understand:

- the major parts of the system;
- the responsibility of each part;
- how parts communicate;
- how data and state move through the system;
- which dependency rules must be preserved;
- which constraints and tradeoffs shaped the structure;
- which decisions are confirmed, proposed, or unresolved.

The central question is:

> **How is this system structured, and why?**

## Document responsibility

`ARCHITECTURE.md` owns structural technical decisions and boundaries.

It is not:

- a product requirements document;
- a visual design description;
- a complete behavioral specification;
- a step-by-step implementation plan;
- an API reference;
- a database-schema dump;
- a list of every source file;
- a record of every minor coding choice.

Use the related documents according to their responsibility:

| Document | Main responsibility |
|---|---|
| `REQUIREMENTS.md` | Product outcomes, rules, constraints, and quality expectations |
| `DESIGN.md` | Visual, responsive, and interaction intent |
| `SPEC.md` | Precise and testable behavior |
| `ARCHITECTURE.md` | System structure, boundaries, dependencies, and technical decisions |
| `PLAN.md` | Implementation order, affected files, dependencies, and validation |

## When a separate architecture document is appropriate

Create a separate `ARCHITECTURE.md` when the project or feature has meaningful structural decisions involving one or more of these areas:

- multiple applications, packages, services, or runtime boundaries;
- routing or navigation architecture;
- significant component or feature boundaries;
- shared state or complex data flow;
- APIs or third-party integrations;
- persistence or migrations;
- authentication or authorization;
- background processing;
- build and deployment infrastructure;
- security, reliability, or observability boundaries;
- architectural migration from an existing system.

A separate architecture document may be unnecessary for a genuinely small static page or isolated component with no meaningful structural decisions. In that case:

1. Record why the architecture stage was skipped.
2. Put the necessary structural decisions in `SPEC.md` or `PLAN.md`.
3. Keep architecture references optional in later workflow stages.

## Evidence before decisions

Architecture must be grounded in the actual project.

Inspect:

- the repository structure;
- package and dependency files;
- build and deployment configuration;
- existing components, modules, services, and utilities;
- current data-access and state-management patterns;
- tests and validation infrastructure;
- `REQUIREMENTS.md`;
- `DESIGN.md`;
- `SPEC.md`;
- existing technical documentation;
- approved stakeholder or technical decisions.

Do not infer architecture from filenames or framework stereotypes alone.

Distinguish clearly between:

- **Current architecture:** observed in the repository now.
- **Target architecture:** proposed for the implementation.
- **Transitional architecture:** temporary structure required during migration.

Never describe proposed files, layers, or services as if they already exist.

## Examples are non-normative

Technology names, directory structures, hosting providers, and architectural patterns in examples are illustrative only.

Do not adopt them unless supported by:

- repository evidence;
- project constraints;
- requirements or specifications;
- an explicitly approved architectural decision.

Examples must not override the inspected project architecture.

See:

- [`templates/ARCHITECTURE.template.md`](templates/ARCHITECTURE.template.md)
- [`examples/ARCHITECTURE-full-stack-example.md`](examples/ARCHITECTURE-full-stack-example.md)
- [`examples/ARCHITECTURE-component-example.md`](examples/ARCHITECTURE-component-example.md)

## Required content

Not every project needs every subsection, but a useful architecture document should address the following concerns when they apply.

### 1. Purpose and scope

Define:

- what system, application, feature, or component is covered;
- why the document exists;
- what is explicitly outside its scope;
- whether it describes current, target, or transitional architecture.

### 2. Sources and evidence

Record the sources that support the architecture:

- repository paths;
- project documents;
- infrastructure configuration;
- requirement and specification IDs;
- approved decisions.

Important structural claims should be traceable to evidence.

### 3. System context

Describe the system from the outside.

Identify:

- users and actors;
- external systems;
- third-party services;
- major inputs and outputs;
- trust boundaries.

A small context diagram is useful when it improves understanding.

```text
Actor → System boundary → External dependency
```

### 4. Architectural goals

State the project-specific qualities the architecture prioritizes, such as:

- maintainability;
- accessibility;
- testability;
- security;
- reliability;
- performance;
- scalability;
- simplicity;
- replaceable infrastructure.

Do not list generic qualities without explaining their relevance or tradeoffs.

### 5. High-level structure

Describe the major runtime and code boundaries.

Explain:

- the principal applications, packages, services, or components;
- how they communicate;
- where important responsibilities belong;
- which boundaries are current and which are proposed.

The description should remain useful even if individual filenames change.

### 6. Components and responsibilities

For each architecturally significant part, define:

- responsibilities;
- owned state or data;
- dependencies;
- public boundaries;
- responsibilities it must not absorb.

Good architecture documentation protects responsibility boundaries, not just directory names.

### 7. Dependency rules

State what may depend on what.

Examples of rule types:

- direction of dependencies between layers or modules;
- framework-independent boundaries;
- feature-to-shared-code rules;
- UI-to-data-access restrictions;
- allowed integration paths;
- prohibited circular dependencies.

Only define layers or abstractions that the project actually needs.

### 8. Data and interaction flows

Document important flows that clarify boundaries or failure behavior.

For each flow, identify:

- initiator;
- validation boundaries;
- authorization boundaries;
- business-rule ownership;
- data access;
- side effects;
- success and failure results.

Avoid documenting every minor function call.

### 9. State and data ownership

Define:

- authoritative data sources;
- persistent and transient state;
- client, server, or component ownership;
- caching and synchronization;
- validation ownership;
- concurrency and consistency concerns;
- sensitive-data boundaries.

Ambiguous ownership is a common source of duplicated logic and inconsistent state.

### 10. Interface architecture

For frontend or user-interface systems, address when applicable:

- routing and navigation boundaries;
- feature organization;
- shared-component boundaries;
- page and layout composition;
- server state versus interface state;
- data-access boundaries;
- styling and design-system integration;
- rendering strategy;
- error boundaries.

Do not turn this section into a list of every component.

### 11. Service, API, and integration architecture

When applicable, define:

- request and message boundaries;
- external input validation;
- business-rule ownership;
- service or use-case boundaries;
- integration adapters;
- error translation;
- versioning or compatibility expectations;
- background work.

Detailed payload definitions belong in `SPEC.md`, OpenAPI, or dedicated API documentation.

### 12. Persistence architecture

When applicable, describe:

- main entities and relationships;
- persistence ownership;
- transaction boundaries;
- migration strategy;
- retention or deletion behavior;
- mapping between domain, transport, and persistence models;
- consistency constraints.

Avoid copying the complete schema unless it is necessary to understand architectural decisions.

### 13. Authentication and authorization

When applicable, explain:

- identity source;
- authentication flow;
- authorization enforcement;
- protected boundaries;
- session or token lifecycle;
- logout and revocation behavior;
- relevant tradeoffs.

Do not assume an authentication model from an example.

### 14. Accessibility architecture

Document the structural decisions needed to preserve accessibility across components and features.

Address when relevant:

- semantic component boundaries;
- keyboard interaction ownership;
- focus management;
- accessible names and relationships;
- status and error announcements;
- reduced-motion handling;
- reusable accessibility behavior;
- testing responsibility.

Accessibility is an architectural concern when behavior is shared across the system.

### 15. Error handling and reliability

Define:

- error categories;
- propagation and translation;
- user-facing recovery;
- retry and idempotency rules;
- fallback behavior;
- failure boundaries;
- logging and sanitization;
- rollback or recovery where applicable.

### 16. Security and privacy

Document relevant structural controls:

- trust boundaries;
- input validation;
- authorization enforcement;
- secret management;
- sensitive-data handling;
- origin and network controls;
- logging restrictions;
- abuse protection;
- privacy constraints.

Do not invent security or retention policies. Carry unsupported decisions as recommendations or open questions.

### 17. Build, deployment, and runtime

When applicable, describe:

- build outputs;
- environments;
- hosting boundaries;
- configuration;
- networking;
- deployment ordering;
- migrations;
- rollback or recovery;
- runtime constraints.

### 18. Observability

When relevant, define:

- logs;
- metrics;
- traces;
- health checks;
- alerts;
- diagnostic identifiers;
- information that must not be recorded.

The detail should match the project’s operational needs.

### 19. Testing architecture

Explain what belongs in each applicable validation layer:

- unit tests;
- component tests;
- integration tests;
- contract tests;
- end-to-end tests;
- accessibility validation;
- visual validation.

Testing boundaries should align with architectural boundaries.

### 20. Architectural decisions

Record significant decisions with:

- status;
- context;
- selected option;
- rationale;
- alternatives considered;
- tradeoffs and consequences;
- traceability to requirements or specifications.

Use separate Architecture Decision Records when decisions require independent review, history, or replacement.

### 21. Constraints and tradeoffs

State accepted limitations honestly.

Architecture always involves tradeoffs. A document describing only benefits is incomplete.

### 22. Risks, assumptions, and open questions

Record:

- architectural risks;
- unsupported assumptions;
- unresolved technical decisions;
- decisions requiring stakeholder approval;
- blocking versus non-blocking status.

Do not silently resolve uncertainty through convention or preference.

### 23. Future evolution

Describe likely extension points only when useful.

Future possibilities must not become accidental current requirements. Mark them clearly as outside the present scope unless approved elsewhere.

### 24. Traceability and validation

Map important architecture decisions to:

- requirement IDs;
- specification sections or IDs;
- repository evidence;
- implementation tasks;
- validation methods.

## Evidence and uncertainty labels

Use the workflow’s shared classifications:

- **Confirmed:** established by project documentation or an approved decision.
- **Observed:** directly visible in the repository or infrastructure.
- **Inferred:** strongly suggested but not confirmed.
- **Recommended:** proposed to resolve a structural concern.
- **Open question:** cannot be determined safely.

Architecture documents should not blur observed current structure with recommended target structure.

## Level of detail

The correct level is:

> Detailed enough to guide implementation and protect architectural boundaries, but not so detailed that routine code changes make the document obsolete.

Good:

```md
Feature modules may depend on shared UI primitives, but shared primitives must not import product-feature code.
```

Too vague:

```md
The project follows best practices.
```

Too implementation-specific:

```md
Line 42 of `feature-service.ts` calls `repository.findById()`.
```

Prefer stable boundaries, ownership, flows, and decision rationale over temporary implementation details.

## Common failure modes

Avoid:

- documenting an imagined architecture without inspecting the repository;
- copying an example stack into an unrelated project;
- listing folders without explaining responsibilities;
- introducing layers that solve no current problem;
- mixing product requirements with technical decisions;
- duplicating the full specification or implementation plan;
- treating proposed structure as current structure;
- omitting dependency rules;
- ignoring accessibility, security, errors, or testing where relevant;
- describing only advantages and hiding tradeoffs;
- turning future ideas into current commitments;
- leaving major decisions without evidence or traceability.

## Review checklist

Before completing `ARCHITECTURE.md`, verify:

### Completeness and correctness

- [ ] The document has a clear scope.
- [ ] Current, target, and transitional architecture are distinguished.
- [ ] Repository observations are accurate.
- [ ] Major boundaries and responsibilities are documented.
- [ ] Dependency rules are explicit.
- [ ] Important data, state, and interaction flows are covered.
- [ ] Relevant accessibility, security, error, deployment, and testing concerns are included.
- [ ] Tradeoffs, constraints, and risks are stated.

### Consistency, traceability, risks, and uncertainty

- [ ] Architecture decisions support `REQUIREMENTS.md` and `SPEC.md`.
- [ ] The document does not contradict `DESIGN.md`.
- [ ] Proposed structures are not presented as existing files.
- [ ] Decisions reference evidence or approved constraints.
- [ ] Inferences and recommendations are labeled.
- [ ] Open questions remain visible.
- [ ] Example technologies were not adopted without project evidence.
- [ ] The architecture can guide `PLAN.md` without duplicating implementation sequencing.

## Quality test

After reading `ARCHITECTURE.md`, a developer should be able to answer:

1. What are the major parts of the system?
2. What responsibility belongs to each part?
3. Which dependencies are allowed or prohibited?
4. How do data and state move through the system?
5. Where do validation and business rules belong?
6. How are external systems and persistence isolated?
7. How are accessibility, errors, security, and testing supported structurally?
8. What is current versus proposed?
9. Which tradeoffs and risks were accepted?
10. Which decisions must not be changed casually?

When these answers remain unclear, the document needs more precision.
