# Quickstart

Start the Figma-to-implementation workflow entirely online through ordinary ChatGPT. You only need to configure the repository URL before the first chat.

## 1. Create the ChatGPT Project

Create a ChatGPT Project, copy [`Project-settings--Instructions.md`](Project-settings--Instructions.md) into the Project Instructions, and replace:

```text
<REPOSITORY_URL>
```

with the GitHub repository that should own the implementation.

You do not need to clone the repository, open a terminal, prepare application scaffolding, choose a workflow profile, or configure the rest of the project before starting.

## 2. Start

Open a new chat in that Project and say:

> **Start the implementation workflow.**

ChatGPT inspects the repository and asks only for required information, permissions, assets, or consequential decisions that it cannot resolve safely.

## 3. Answer what is needed

Provide information progressively when ChatGPT asks for it. Depending on the project, that can include the design source, an authorized Figma scope, your preferred review style, a missing asset, or access to a connected service.

You do not need to choose internal adapters, execution transports, workflow profiles, or state-management mechanics.

## 4. Review the work

Follow the review prompts presented by the workflow. After the approved implementation work is complete, review the actual evidence and result before accepting it.

A pull request, automated implementation evidence, and any applicable runtime evidence remain separate from final human acceptance. Missing optional deployment does not invalidate otherwise valid implementation evidence unless runtime evidence is part of the approved scope.

## 5. Continue later

The repository owns durable project configuration and workflow state. In a later chat in the same ChatGPT Project, say:

> **Continue the implementation workflow.**

ChatGPT resumes from repository-owned state instead of asking you to reconstruct the project from conversation memory.

## Want to understand the mechanics?

You do not need the internal architecture to use the workflow. If you want to understand, audit, or extend it, read [How it works](workflow/How-It-Works.md). Canonical rules remain in the contracts linked from that document.
