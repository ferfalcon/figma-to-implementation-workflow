# How It Works

This document explains the product architecture at a high level. It is not a second source of truth for workflow rules. When a detail matters operationally, follow the canonical contract linked from the relevant section.

## The product journey

The human-facing workflow is intentionally small:

1. Put the repository URL in the ChatGPT Project Instructions.
2. Say `Start the implementation workflow.`
3. Answer only the questions ChatGPT cannot resolve safely.
4. Review the required planning gate or gates.
5. Review the implementation evidence and final result.
6. Return later with `Continue the implementation workflow.`

Everything else exists to make that path reproducible and safe.

## 1. The repository is the project identity

[`Project-settings--Instructions.md`](../Project-settings--Instructions.md) gives ChatGPT one bootstrap locator: the implementation repository URL.

Durable project context does not live in chat memory. The default-branch `design-workflow.config.json` is the canonical stable project configuration. Executable workflow progress lives separately in `.workflow/workflow-record.json` on the saved working branch.

Configuration ownership, migrations, and revision identity are defined by [Project Configuration](Project-Configuration.md). Executable state ownership is defined by [State Ownership](State-Ownership.md).

## 2. The toolkit is an immutable dependency

A new consumer resolves the latest stable toolkit release and dereferences it to one exact commit SHA. Existing projects preserve their already-pinned exact revision.

That exact revision supplies the bootstrap instructions, CLI behavior, schemas, adapters, and workflow contracts used by the project. Consumer execution must not silently fall back to mutable `main` or another moving reference.

Distribution rules are defined by [Toolkit Distribution](Toolkit-Distribution.md).

## 3. Project information is discovered progressively

The repository URL is the only project value required before the first chat. Other information is resolved when it becomes relevant.

ChatGPT can discover or ask for design context, authorized design scope, review style, assets, implementation boundaries, provider access, or runtime information. It should infer non-consequential values when safe and ask only for missing required information, missing capabilities, consequential decisions, or real blockers.

The user does not choose workflow profiles, source adapters, implementation adapters, deployment adapters, or execution transports as onboarding routes.

The conversational behavior is owned by [ChatGPT Experience](ChatGPT-Experience.md).

## 4. Adapters translate external environments into one workflow

Adapters are capabilities underneath one product journey, not alternate workflows.

- [Source Adapters](Source-Adapters.md) normalize design/reference evidence such as Figma or other supported source formats.
- [Implementation Adapters](Implementation-Adapters.md) determine how approved work maps into the repository. Astro + TypeScript is the maintained implementation adapter; existing frameworks are preserved on the best-effort path unless a migration is explicitly in scope.
- [Deployment Adapters](Deployment-Adapters.md) provide optional provider-specific runtime evidence without making deployment a global prerequisite.

The machine-readable adapter registry is [`adapter-catalog.json`](adapter-catalog.json).

## 5. One workflow engine owns executable progress

The canonical implementation process is defined by [Design Implementation Workflow](Design-Implementation-Workflow.md). The engine records stages, gates, tasks, lineage, evidence, and approvals in repository-owned state.

Profiles change the amount of rigor required for a project, but profile classification is an internal workflow decision based on actual complexity and risk. It is not a separate user route.

Generated context files are projections of canonical state. They help agents recover routing information, but they are not independent authorities.

## 6. Execution transport is separate from workflow logic

The same canonical CLI owns workflow mutations whether execution happens directly or through an authorized remote transport.

Ordinary ChatGPT prefers direct CLI execution when available. When it is not available, the current remote path uses a pinned GitHub workflow caller and GitHub Actions to execute the same toolkit revision against an expected repository head.

Transport rules are defined by [Execution Transports](Execution-Transports.md), with the current remote provider described in [GitHub Remote Execution](GitHub-Remote-Execution.md).

## 7. Evidence and acceptance are different layers

Automated checks can prove that a specific implementation commit built, type-checked, passed browser tests, or satisfied other project validations. A deployment adapter can additionally prove that inspected runtime evidence belongs to that same tested commit when runtime evidence is relevant.

Neither layer automatically equals human acceptance. Final acceptance remains a human decision, and production publication is separate again.

Evidence requirements are defined by [Validation Rules](Validation-Rules.md).

## 8. Product acceptance validates the real ChatGPT experience

Repository CI proves engineering contracts. It does not prove that a real person can start from the repository URL in ordinary ChatGPT and complete the product journey.

[Product Acceptance](Product-Acceptance.md) therefore defines separate maintainer QA using real sessions. The public, non-sensitive summary of the latest attested result lives in [`product-status.json`](product-status.json). That status file is an attestation only: it does not contain private conversation evidence, does not control releases, and is not executable workflow state.

## Canonical reference map

| Concern | Canonical owner |
|---|---|
| Human installation artifact | [`Project-settings--Instructions.md`](../Project-settings--Instructions.md) |
| Conversational product behavior | [ChatGPT Experience](ChatGPT-Experience.md) |
| Project configuration | [Project Configuration](Project-Configuration.md) |
| Executable workflow process | [Design Implementation Workflow](Design-Implementation-Workflow.md) |
| Workflow state | [State Ownership](State-Ownership.md) |
| Agent routing and gates | [Agent Orchestration](Agent-Orchestration.md) |
| Source classification | [Source Adapters](Source-Adapters.md) |
| Implementation environment | [Implementation Adapters](Implementation-Adapters.md) |
| Runtime providers | [Deployment Adapters](Deployment-Adapters.md) |
| Execution mechanism | [Execution Transports](Execution-Transports.md) |
| Verification | [Validation Rules](Validation-Rules.md) |
| Stable toolkit distribution | [Toolkit Distribution](Toolkit-Distribution.md) |
| Real-user product QA | [Product Acceptance](Product-Acceptance.md) |
| Public product-QA attestation | [`product-status.json`](product-status.json) |

When this explainer and a canonical contract disagree, the canonical contract wins.
