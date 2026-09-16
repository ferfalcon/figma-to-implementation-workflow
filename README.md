# Figma to Implementation Workflow

Turn a Figma design into working frontend code through ChatGPT — entirely online.

You can start without a local development environment. You do not need to clone the repository, open a terminal, install Node.js, or run a package manager to get your first working implementation.

The workflow uses ChatGPT as the interface between your design, your GitHub repository, and the services needed to build and verify the result. Deployment is an optional evidence layer unless the approved project scope explicitly requires a runtime.

## Just want to use it? Do this.

1. **Choose the GitHub repository you want to use.**
2. **Create a ChatGPT Project.**
3. **Copy the project instructions into the Project Instructions.** Use [`Project-settings--Instructions.md`](Project-settings--Instructions.md).
4. **Replace `<REPOSITORY_URL>` with your repository URL.**
5. Start a chat and say:

   > **Start the implementation workflow.**

That's it.

The repository URL is the only project information you need to configure up front.

ChatGPT will inspect the repository, determine what information or permissions are missing, resolve the implementation environment, and ask you only for what it needs to continue. You do not need to prepare all workflow inputs in advance, choose an internal framework route, or configure workflow state manually.

If GitHub, Figma, a deployment provider, an asset, or a project decision is required, ChatGPT asks for it when it becomes relevant.

For the shortest first-run and resume instructions, use the [Quickstart](QUICKSTART.md).

## What happens next

Once ChatGPT knows which repository owns the implementation, it progressively establishes the rest of the project context, inspects the actual sources, prepares the implementation plan, works through the required review gates, writes the code through GitHub, runs the available verification, and returns the result for human review.

A safely scaffoldable root or an existing Astro + TypeScript application uses the maintained Astro adapter. An existing application using another framework is preserved and handled through the best-effort existing-framework adapter rather than being silently replaced with Astro.

You can leave and continue later. The repository owns the durable workflow state needed for another conversation to continue the work.

## What you get

- A working implementation of the selected design.
- Code committed to your GitHub repository.
- A pull request you can inspect, review, and continue developing from.
- Automated type, build, browser, responsive, and accessibility checks where supported by the project.
- Matching deployment/runtime evidence when a configured provider is available and relevant.
- A clear `Not applicable` runtime status when no deployment is configured or required.
- A clear separation between automated verification, runtime evidence, and final human acceptance.

Astro + TypeScript is the **maintained implementation adapter** for new scaffoldable frontends and existing Astro + TypeScript projects. Existing frameworks are preserved on a best-effort path. Persistence, authentication, backend work, framework migration, server rendering, and production publishing are supported only when explicitly in scope and subject to the normal architecture/profile rules.

## Fully online by design

One of the main goals of this project is to make the first implementation accessible without requiring a traditional local development setup.

You can run the workflow from any device that gives you access to ChatGPT and the required connected services. The code still lives in GitHub, the design still lives in Figma, and deployment happens through a deployment provider only when one is used — ChatGPT coordinates the work between them.

A local checkout remains useful when an engineer wants to take over or extend the result, but it is not a prerequisite for using the workflow.

## How the workflow works

The human-facing interaction is intentionally simple. Behind it, repository-owned configuration and workflow state, pinned toolkit releases, capability adapters, execution transports, validation evidence, and human review keep the process reproducible.

You do not need to understand those mechanics to use the workflow. If you want the conceptual architecture, read [How it works](workflow/How-It-Works.md). That explainer links to the canonical contracts rather than duplicating their rules.

## Product acceptance status

Repository CI and real-user product acceptance are different signals. The public, non-sensitive attestation for the latest real-session product QA lives in [`workflow/product-status.json`](workflow/product-status.json).

A `pending` status means there is no current public attestation for an accepted toolkit revision. An `accepted` status identifies the exact toolkit commit and scenario coverage that maintainers have attested after the real-session process defined by [Product Acceptance](workflow/Product-Acceptance.md). The status file is not private evidence, executable workflow state, or a release gate.

## Under the hood

If you want to understand, audit, or extend the system, start with these references:

- [Quickstart](QUICKSTART.md) — the shortest first-run and resume guide.
- [How it works](workflow/How-It-Works.md) — a non-authoritative map of the product architecture and its canonical owners.
- [ChatGPT experience](workflow/ChatGPT-Experience.md) — capability checks, conversational setup, review behavior, assets, runtime evidence, and recovery.
- [Workflow stages](workflow/Design-Implementation-Workflow.md) — the canonical implementation process.
- [Implementation adapters](workflow/Implementation-Adapters.md) — repository-driven implementation-environment resolution and maintained/best-effort adapter rules.
- [Deployment adapters](workflow/Deployment-Adapters.md) — optional provider-neutral runtime evidence and commit-binding rules.
- [Project configuration](workflow/Project-Configuration.md) — repository-owned project configuration and migration rules.
- [Toolkit distribution](workflow/Toolkit-Distribution.md) — stable GitHub Release channel, validation gates, version tags, and exact-SHA release identity.
- [Product acceptance](workflow/Product-Acceptance.md) — the real-user QA process that can support a public status attestation.
- [Product status](workflow/product-status.json) — the current non-sensitive product-QA attestation.
- [GitHub remote execution](workflow/GitHub-Remote-Execution.md) — how executable work runs without requiring a local checkout.
- [State ownership](workflow/State-Ownership.md) — canonical workflow state and generated views.
- [Agent orchestration](workflow/Agent-Orchestration.md) — executable workflow behavior and gates.
- [Consumer agent bootstrap](AGENTS-instructions.md) — minimal runtime bootstrap and safety guardrails for implementation projects.
- [Toolkit repository guidelines](AGENTS.md) — maintainer-facing development and validation expectations.
- [Figma preparation](source-adapters/FIGMA-PREPARATION.md) — design-source preparation rules.
- [Validation rules](workflow/Validation-Rules.md) — required implementation evidence and checks.
- [CLI reference](cli/README.md) — maintainer and direct CLI operations.
- [Contribution guide](CONTRIBUTING.md) — development and contribution guidance.

## For maintainers

The workflow engine, immutable toolkit binding, profiles, schemas, generated artifacts, maintainer packaging, and compatibility rules are implementation concerns rather than onboarding requirements. Their detailed contracts remain in the workflow documentation and source tree.

The canonical consumer-facing installation artifact is [`Project-settings--Instructions.md`](Project-settings--Instructions.md). It contains the repository bootstrap locator and host/bootstrap rules; durable project values remain repository-owned.

## License

Licensed under the MIT License. See [LICENSE](LICENSE).
