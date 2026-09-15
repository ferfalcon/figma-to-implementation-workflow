# Execution Transports

Execution transports define **where and how the canonical `design-workflow` CLI executes** when workflow preflight or mutation is required. They are transports for one workflow engine, not alternate workflows, state authorities, approval systems, or execution modes.

The workflow has one canonical executable engine: `design-workflow`. A transport may make that engine available in a particular environment, but it must not reimplement workflow legality or mutate canonical state independently.

## Core invariant

**One engine, multiple transports.**

The same CLI owns executable workflow state and transition legality regardless of whether it runs directly in the current environment or through an authorized remote executor.

A transport must never:

- directly edit `.workflow/workflow-record.json` or `.workflow/generated/*`;
- reinterpret a failed or unavailable CLI command as a successful workflow transition;
- grant approval authority merely because it can execute commands;
- create a second stage/task state machine;
- silently change the pinned toolkit revision.

## Ownership boundary

[`Agent-Orchestration.md`](Agent-Orchestration.md) owns when workflow execution is needed and how the agent proceeds from current state. [`State-Ownership.md`](State-Ownership.md) owns canonical mutable state and approval/control boundaries. This contract owns transport selection and the provider-neutral requirements every execution transport must preserve.

Transport availability is a live capability observation. It does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json`. Project configuration may identify stable project resources; it must not persist whether a particular chat/runtime can execute the CLI locally or remotely.

## Transport resolution

Resolve execution capability internally rather than asking the human to choose a transport:

1. **Direct execution.** Use the canonical CLI directly when it can actually execute in the current environment.
2. **Authorized remote execution.** When direct execution is unavailable, discover a supported remote transport and use it only when it is installed/authorized or can be safely installed within the user's approved scope.
3. **Blocked execution.** If neither path can run the canonical CLI, report the exact capability, permission, policy, or transport blocker. Do not invent state or substitute manual record edits.

Transport selection is operational capability resolution, not product configuration and not a workflow profile decision.

## Remote transport contract

A supported remote transport must:

- invoke the canonical CLI with an argument vector rather than emulate commands;
- run against the intended repository/ref and fail closed on stale or conflicting repository identity;
- respect the workflow's immutable toolkit binding and execute the exact required toolkit revision;
- preserve repository/path containment and reject unsafe filesystem escapes;
- use an authenticated, authorized actor with only the permissions needed for the transport;
- preserve optimistic concurrency or an equivalent protection against overwriting concurrent branch changes;
- validate canonical CLI output before committing transport-produced mutations;
- keep approval evidence separate from command-submission authority;
- report command results and failures without manufacturing workflow success.

Provider-specific command envelopes, permissions, workflows, and installation procedures belong in the provider transport document rather than in this contract.

## Bootstrap boundary

Transport resolution can be needed before a CLI-managed workflow record exists. For that reason, execution transport discovery is a bootstrap/orchestration concern rather than a stage-local conditional resource.

After initialization, the agent packet or freshness-verified portable projection remains the workflow-reading boundary. A remote transport can execute CLI-owned preflight and mutations, but it does not become another source of workflow state.

## Current transports

- **Direct CLI** — built-in preferred transport when `design-workflow` is executable in the current environment.
- [`GitHub-Remote-Execution.md`](GitHub-Remote-Execution.md) — GitHub Issues + GitHub Actions remote transport for environments that can work through GitHub but cannot execute the CLI directly.

Additional transports may be added without changing workflow stages, workflow-record schema, approval semantics, or asking the user to choose another workflow route.

## Failure semantics

Transport failure blocks the CLI operation that requires execution; it does not redefine the underlying workflow.

Examples include:

- CLI unavailable in the current environment;
- remote transport not installed or not authorized;
- repository or organization policy rejecting the executor;
- stale branch identity or concurrency conflict;
- pinned toolkit revision unavailable or untrusted;
- command rejection by the canonical CLI;
- post-command validation failure.

Report the specific blocker and recover through the canonical engine. Never repair a transport failure by hand-editing executable workflow state.
