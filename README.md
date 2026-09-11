# Design-to-Implementation Workflow

## Figma ↔ GitHub, safely connected through ChatGPT

Turn selected Figma designs into an editable Astro + TypeScript project, a GitHub pull request, and a verified Vercel preview using ordinary ChatGPT and existing plugins.

[Get started →](QUICKSTART.md)

Connect Figma, GitHub, and Vercel; create a project from the maintained Astro starter; set your repository locator once; and tell ChatGPT: **“Start the implementation workflow for this Figma design.”**

### Choose how you review

| Review style | What you approve |
|---|---|
| Brief and final preview | The complete implementation brief, then the working preview. Material changes still require a decision. |
| Every stage | Each stage under the existing Gated mode. |

Choose once during setup. The preference and working branch are saved in the project, so a new chat can continue where you left off. Neither preference changes design fidelity, evidence requirements, or human final acceptance.

### What you get

- Astro components, TypeScript, shared native CSS, and working browser interactions.
- Durable design assets saved in your repository.
- A pull request, implementation commit, and matching preview URL.
- Executed type, build, browser, responsive, and automated accessibility checks.
- A clear distinction between automated verification and human visual acceptance.

New frontend projects are the maintained v1 path. Neon, persistence, authentication, existing-framework adaptation, and production publishing are later or explicitly scoped work. Preview acceptance does not automatically merge or promote production.

## Release status

The Astro starter is a release candidate until the [ordinary-ChatGPT acceptance criteria](workflow/Product-Acceptance.md) pass. CI builds downloadable candidate bundles for testing. The generated companion template and public release assets are published only after recorded sessions with both personas and verified previews pass the release guard. See [releases](https://github.com/ferfalcon/figma-to-implementation-workflow/releases) for published assets.

## Repository-owned project configuration

Root design-workflow.config.json owns project identity, design scope, implementation root, and deployment targets. Configuration v2 also owns the selected review style and working branch. Existing v1 configurations retain their established behavior until explicit adoption.

[Project configuration](workflow/Project-Configuration.md) owns the schema, branch discovery, and migration contract. [ChatGPT experience](workflow/ChatGPT-Experience.md) owns capability checks, review preferences, previews, assets, and recovery.

## External pinned toolkit model

The toolkit remains an external dependency. A generated project receives application scaffolding and a thin caller pinned to an exact toolkit commit, not a copy of the engine, prompts, or workflow handbook.

Before initialization, the installed caller's immutable revision is the bootstrap identity. After initialization, .workflow/workflow-record.json owns the canonical toolkit binding. [GitHub remote execution](workflow/GitHub-Remote-Execution.md) runs that same canonical CLI.

Existing projects can still request **“Install the Design-to-Implementation Workflow in this repository.”** Installation remains setup for the same workflow.

## Workflow and state

The toolkit supports one executable control mode and one manual/scaffold mode:

- **CLI-managed:** the canonical record owns executable workflow state; AI-agent orchestration uses this mode. Generated views are read-only.
- **Markdown-only manual/scaffold:** narrative drafting without executable workflow state or agent orchestration.

The evidence chain remains source baseline → audit → requirements/design/specification → reviews and planning → tasks → implementation → validation and human acceptance. Express, Lite, Standard, and Full remain evidence-based artifact profiles selected by the workflow.

Never hand-edit the canonical record or generated views. [State ownership](workflow/State-Ownership.md) and [agent orchestration](workflow/Agent-Orchestration.md) define the operational contracts.

## Consumer bundle

Maintainers generate the Astro starter or the existing thin bundle from an immutable toolkit revision. Consumer instructions are generated from [AI-project-settings.md](AI-project-settings.md). The starter's dependency lockfile is separate from the dependency-free toolkit CLI.

[CLI reference](cli/README.md) covers build and validation commands. The [consumer bootstrap](AGENTS-instructions.md) remains the agent's pinned execution entry point.

## Reference contracts

- [Workflow stages](workflow/Design-Implementation-Workflow.md), [profiles](workflow/Workflow-Profiles.md), and [artifact identifiers](workflow/Identifier-Conventions.md).
- [Source snapshots](workflow/Source-Snapshots.md), [source authority](workflow/Source-Authority.md), and [validation rules](workflow/Validation-Rules.md).
- [Contract compatibility](workflow/Contract-Compatibility.md) and [schemas](schemas/README.md).
- [Figma preparation](source-adapters/FIGMA-PREPARATION.md) and its [explicit preparation launcher](AGENTS-PROMPT-Figma-file-preparation.md).
- [Contribution guide](CONTRIBUTING.md) and [toolkit-development instructions](AGENTS.md).

## License

Licensed under the MIT License. See [LICENSE](LICENSE).
