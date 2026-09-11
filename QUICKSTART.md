# Quickstart: Start the Implementation Workflow

Use ordinary ChatGPT with plugins to turn a Figma design into an Astro + TypeScript project, a GitHub pull request, and a verified preview.

## 1. Connect your plugins

In ordinary ChatGPT, connect:

- GitHub for the implementation repository.
- Figma for design inspection and authorized design changes.
- Vercel for preview status and inspection.

Use a personal ChatGPT account with the required plugin actions available. ChatGPT checks actual Figma Design access, repository writes, command issues, Actions results/logs, and preview access. Installing a plugin is not proof that every action is available.

This flow does not invoke Work or Codex. Ordinary ChatGPT and provider usage still apply. Neon is optional and not required for the first frontend preview.

## 2. Create your project

Use the Astro template linked from a [validated release](https://github.com/ferfalcon/figma-to-implementation-workflow/releases). It contains the application scaffold, a lockfile, browser tests, a validation workflow, and the pinned workflow caller.

During release-candidate testing, use the generated starter bundle from repository CI instead. Create an empty GitHub repository in the browser and upload the contents of its repository/ directory, including .github/. Do not upload the outer bundle directory.

Import the new repository into Vercel once and connect the same project to the Vercel plugin. Branch pushes will receive preview deployments. Connecting the initial sample does not mean your Figma design has been implemented.

The starter contains sample pages to verify the setup. ChatGPT will replace those pages and their sample-specific tests with the approved design.

## 3. Set the repository locator once

Copy the generated ChatGPT-Project-Instructions.md into an ordinary ChatGPT Project's instructions. Alternatively use [AI-project-settings.md](AI-project-settings.md). Replace only the repository locator with your implementation repository URL.

ChatGPT reads or creates design-workflow.config.json. This file holds the design source/scope, implementation root, review preference, working branch, and deployment target across chats. You do not need to edit JSON or repeat these values.

## 4. Start with your Figma link

Tell ChatGPT:

> Start the implementation workflow for this Figma design: [your selected frame or page link].

ChatGPT verifies the project connections and asks for:

- The intended scope or behavior that cannot be established from the design.
- Your preferred review style, once.
- Any required asset that plugins cannot transfer; upload that export through the GitHub browser interface during setup.

Choose the review style that fits your work:

| Style | Your involvement |
|---|---|
| Brief and final preview | Approve the implementation brief, then review the working result. |
| Every stage | Review and explicitly approve each workflow stage. |

Both preserve final human acceptance. Material scope changes can require another decision. Native plugin permission prompts follow your account settings.

ChatGPT creates and remembers a working branch, inspects the design, classifies the smallest valid workflow profile, and starts the canonical workflow. Figma preparation is not a separate user workflow route and requires authorized design changes when needed.

## 5. Review or continue

ChatGPT returns the PR, implementation commit, matching Vercel preview, actual verification results, and remaining deviations. Check the visual result against Figma and ask for corrections or accept it.

A new chat in the same Project can say “Continue the implementation workflow” or “Show the current preview.” The repository owns the working branch and progress. Final acceptance does not automatically merge or publish production.

If a plugin, build, asset, or preview is unavailable, ChatGPT reports that specific blocker. It does not claim success or switch to Work or Codex.

## Existing projects and advanced reference

“Install the Design-to-Implementation Workflow in this repository” remains a setup action, not a second workflow route. Existing v1 configurations retain their established ref and execution mode until you intentionally adopt the new preferences.

Installation, immutable toolkit pins, the canonical CLI, and remote execution mechanics are owned by [GitHub Remote Execution](workflow/GitHub-Remote-Execution.md) and [Agent Orchestration](workflow/Agent-Orchestration.md). [Project Configuration](workflow/Project-Configuration.md) owns setup and v1 adoption.

Markdown-only is a manual/scaffold mode without executable workflow state, generated routing, or agent orchestration. The ChatGPT product uses CLI-managed state.

### Manual fallback: thin consumer bundle

Maintainers can still generate the thin caller and instructions for an existing repository. It does not include application scaffolding or vendor the toolkit. See the [CLI reference](cli/README.md) for direct installation and bundle generation.

Detailed agent behavior for both review styles, capability checks, assets, recovery, and preview evidence is owned by [ChatGPT Experience](workflow/ChatGPT-Experience.md).
