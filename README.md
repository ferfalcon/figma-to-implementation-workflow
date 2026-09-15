# Figma to Implementation Workflow

Turn a Figma design into working frontend code through ChatGPT — entirely online.

No local development environment is required. You do not need to clone the repository, open a terminal, install Node.js, or run a package manager to get your first working implementation.

The workflow uses ChatGPT as the interface between your design, your GitHub repository, and the services needed to build, verify, and preview the result.

## Just want to use it? Do this.

1. **Choose the GitHub repository you want to use.**
2. **Create a ChatGPT Project.**
3. **Copy the project instructions into the Project Instructions.** Use [`Project-settings--Instructions.md`](Project-settings--Instructions.md).
4. **Replace `<REPOSITORY_URL>` with your repository URL.**
5. Start a chat and say:

   > **Start the implementation workflow.**

That's it.

The repository URL is the only project information you need to configure up front.

ChatGPT will inspect the repository, determine what information or permissions are missing, and ask you only for what it needs to continue. You do not need to prepare all of the workflow inputs in advance or configure its internal state manually.

If GitHub, Figma, Vercel, an asset, or a project decision is required, ChatGPT will ask for it when it becomes relevant.

## What happens next

Once ChatGPT knows which repository owns the implementation, it can progressively establish the rest of the project context.

Depending on the project, it may ask for the Figma design or scope, a decision that cannot be inferred safely, a required service connection, or an asset that is not available through the connected tools.

From there the workflow inspects the actual sources, prepares the implementation plan, works through the required review gates, writes the code through GitHub, runs the available verification, and returns the result for human review.

You can leave and continue later. The repository owns the durable workflow state needed for another conversation to continue the work.

## What you get

- A working implementation of the selected design.
- Code committed to your GitHub repository.
- A pull request you can inspect, review, and continue developing from.
- Automated type, build, browser, responsive, and accessibility checks where supported by the project.
- A matching preview when the configured deployment provider is available.
- A clear separation between automated verification and final human visual acceptance.

The maintained frontend path currently targets Astro + TypeScript. Existing-framework adaptation, persistence, authentication, backend work, and production publishing are supported only when explicitly in scope.

## Fully online by design

One of the main goals of this project is to make the first implementation accessible without requiring a traditional local development setup.

You can run the workflow from any device that gives you access to ChatGPT and the required connected services. The code still lives in GitHub, the design still lives in Figma, and deployment still happens through the deployment provider — ChatGPT coordinates the work between them.

A local checkout remains useful when an engineer wants to take over or extend the result, but it is not a prerequisite for using the workflow.

## How the workflow works

The human-facing interaction is intentionally simple. Behind it, the workflow keeps a stricter engineering process: it establishes source authority, inspects the design and repository, records project state, determines the appropriate workflow profile, creates implementation artifacts, requires the necessary approvals, validates the result, and preserves enough evidence for the work to be continued safely.

You do not need to understand those mechanics to use the workflow.

## Under the hood

If you want to understand, audit, or extend the system, the detailed contracts live outside this README:

- [Quickstart](QUICKSTART.md) — the detailed first-run and resume guide.
- [ChatGPT experience](workflow/ChatGPT-Experience.md) — capability checks, conversational setup, review behavior, assets, previews, and recovery.
- [Workflow stages](workflow/Design-Implementation-Workflow.md) — the canonical implementation process.
- [Project configuration](workflow/Project-Configuration.md) — repository-owned project configuration and migration rules.
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

The workflow engine, immutable toolkit binding, profiles, schemas, generated artifacts, release machinery, and compatibility rules are implementation concerns rather than onboarding requirements. Their detailed contracts remain in the workflow documentation and source tree.

The canonical consumer-facing installation artifact is [`Project-settings--Instructions.md`](Project-settings--Instructions.md). It contains the repository bootstrap locator and host/bootstrap rules; durable project values remain repository-owned.

## License

Licensed under the MIT License. See [LICENSE](LICENSE).
