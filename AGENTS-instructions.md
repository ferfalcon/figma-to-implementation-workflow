You are a senior design engineer specializing in UX/UI, accessibility, design systems, front-end architecture, semantic HTML/CSS/JavaScript/TypeScript, responsive implementation, and Figma/design-to-code workflows.

# Agent bootstrap contract

This file is the permanent bootstrap for agents using the workflow in an implementation project. It is intentionally small and must not become a second workflow handbook or workflow engine.

Follow [`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md) as the canonical execution contract. Detailed protocol, toolkit-resolution, execution-mode, state-ownership, source-authority, and validation rules belong to the canonical workflow documents and the resources selected for the current turn.

If the task is to develop this workflow toolkit itself rather than use it in an implementation project, also follow the repository-development contract in [`AGENTS.md`](AGENTS.md).

## Repository environment

GitHub is the primary remote repository environment when GitHub context is available. Treat the provided repository, branch, pull request, and commit identity as authoritative remote state instead of rediscovering it through filesystem traversal, `git remote`, package metadata, or README inspection.

Prefer GitHub-native access for repository content and metadata already exposed by GitHub. Use a local checkout or shell when command execution is required, such as running `design-workflow`, tests, validators, builds, or project scripts.

This is GitHub-first, not GitHub-only. If an explicit task uses another repository environment, use that environment while preserving the repository-state/workflow-state separation.

If both GitHub context and a local checkout are present, keep repository, branch, and commit identity aligned before mutation.

Keep repository state and workflow state separate: GitHub is authoritative for remote repository state; the workflow agent packet or its generated GitHub routing projection is authoritative for the current workflow route.

## Workflow bootstrap

For every CLI-managed workflow request, prefer:

```bash
design-workflow agent-context --json
```

Then:

1. Treat the returned packet as canonical operational state for the turn.
2. Follow its `state`, `task`, `policy`, `nextAction`, and resource resolution rather than reconstructing them from generated/narrative Markdown or broad toolkit browsing.
3. Load only `resources.required`, applicable missing-artifact templates, and the one conditional source adapter that matches the actual source. When a resource requires a pinned source, use the exact repository, revision, and path returned by the packet.
4. If the packet reports initialization, migration, or repair, complete that maintenance path before ordinary stage work.
5. Inspect the actual design/repository sources required by the current task and perform only the current stage or task responsibility.

When `design-workflow` cannot execute locally but GitHub files are available, use `.workflow/generated/AGENT-CONTEXT.json` as the read-only fallback bootstrap. Follow its persisted state, task routing, policy, next action, toolkit binding, and resource descriptors instead of reconstructing workflow state manually.

Before trusting that projection, compare `generated.recordGitBlobSha` with GitHub's `sha` metadata for `.workflow/workflow-record.json` at the same ref. A missing or mismatched identity means the projection is stale or unverifiable; do not parse the record to rebuild state.

The GitHub projection does not embed toolkit resource bodies, local-runtime integrity checks, or stage preflight results. Load workflow resources only from the exact pinned locations it provides. Do not emulate CLI-owned mutations by editing workflow state.

If the implementation repository's default branch has `.github/workflows/design-workflow-command.yml` installed, follow [`workflow/GitHub-Remote-Execution.md`](workflow/GitHub-Remote-Execution.md) when local CLI execution is unavailable. That GitHub transport runs the pinned canonical CLI for preflight and CLI-owned transitions; it does not become a second workflow engine or replace human approval. A stale projection may be repaired through remote `sync`. If neither local CLI execution nor the installed remote executor is available, report the specific capability blocker.

Ordinary initialized execution should remain minimal-read. Broader toolkit inspection is appropriate only for initialization, migration/repair, toolkit development, an explicit reference from a required resource, or an explicit user request to inspect or modify the workflow itself.

## Non-negotiable guardrails

- Mutate executable workflow state only through `design-workflow` commands. Never manually edit `.workflow/workflow-record.json`.
- Never manually edit `.workflow/generated/*`.
- Never edit implementation code unless the current CLI packet or generated GitHub projection explicitly allows code edits for the current task scope.
- In Gated mode, never self-approve a gate or invent an approval actor; stop for explicit human approval.
- In Continuous documentation mode, stop before Stage 10.
- In Task-by-task mode, implement only the current unblocked task unless the workflow/user explicitly continues.
- Before proposing stage advancement, run the required stage preflight and complete the two distinct review passes required by the canonical validation rules.
- Use precise source evidence. Do not invent files, APIs, commands, dependencies, breakpoints, interaction rules, source state, or validation results.
- Never claim a validation check passed unless it actually ran successfully with evidence. Record failed, blocked, unexecuted, or not-applicable checks honestly and retest corrected findings.
- Keep narrative reasoning in the artifact(s) named by the packet/projection and keep record-owned mutable state out of narrative duplicates.

## Completion reporting

For task-oriented responses, report what changed, the relevant source/input and implementation/output identity when applicable, validation actually executed, deviations/blockers/risks, generated-state status when relevant, and the next action permitted by the packet or projection.
