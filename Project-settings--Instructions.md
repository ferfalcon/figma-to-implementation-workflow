# Project locator

- Repository: `<REPOSITORY_URL>`

Use the repository URL above to locate the implementation repository. Resolve everything else progressively from authoritative project sources and connected services, asking the human only when information, permission, approval, or a consequential decision cannot be resolved safely.

The canonical workflow toolkit is `ferfalcon/figma-to-implementation-workflow`.

## Bootstrap every new chat

Start from repository-owned state rather than conversation memory.

1. Locate the implementation repository from the repository URL above and verify its identity and default branch.
2. Resolve the exact toolkit revision before loading workflow instructions:
   - If an initialized `.workflow/workflow-record.json` records the canonical toolkit repository and an exact 40-character commit SHA, use that revision.
   - Otherwise inspect `.github/workflows/design-workflow-command.yml` on the implementation repository's default branch. If it pins the canonical toolkit to one valid exact 40-character commit SHA, preserve that pin.
   - If no valid exact pin exists, resolve the canonical toolkit's latest non-draft, non-prerelease GitHub Release and dereference its release tag to the exact commit SHA.
   - A mutable, malformed, conflicting, or inaccessible pin is a blocker. Never silently fall back to `main`, another moving branch, or a mutable tag.
3. Load `AGENTS-instructions.md` from exactly that toolkit revision. Treat it as the workflow bootstrap contract and resolve every relative toolkit reference it gives against that same repository and exact revision. Do not look for or depend on a vendored toolkit copy inside the implementation repository.
4. Read `design-workflow.config.json` from the implementation repository's default branch when present and follow the pinned toolkit's `workflow/Project-Configuration.md`. Treat repository-owned configuration and workflow state as authoritative. If configuration is absent, establish the required project context progressively and persist only a complete valid configuration before workflow initialization.
5. Continue initialization or resume existing work according to the pinned `AGENTS-instructions.md`, `workflow/ChatGPT-Experience.md`, and the canonical workflow state. Do not reconstruct executable state from conversation history or manually maintained Markdown.

## Interaction rules

Infer safe values from repository evidence and connected services whenever possible. Do not ask the human to choose internal workflow profiles, implementation adapters, execution transports, or other machinery that the workflow can resolve itself.

Ask only when there is genuinely missing required information, ambiguous authorization, a consequential product or architecture decision, a required human review checkpoint, or a capability blocker.

Inspection does not imply permission to mutate a design, repository area, deployment, or workflow state. Respect the boundaries and approvals defined by repository configuration and the pinned workflow contracts.

When asked to start, continue, implement, fix, review, or verify, perform the authorized work through the available connected services, inspect the actual results, and repair failures when the workflow permits it. Never invent approvals, source state, successful mutations, validation results, runtime evidence, or human acceptance.

Never hand-edit executable workflow state or generated workflow projections.

## Reporting

Keep ordinary progress communication concise and human-facing. Hide internal workflow machinery unless it is relevant to a decision, blocker, review, or explicit request.

At meaningful review points and completion, report the actual artifacts and evidence required by the pinned workflow, including the pull request or repository output, implementation commit, validation performed, applicable runtime evidence, deviations or blockers, and the next canonical action.

Final acceptance belongs to the human. Acceptance does not automatically merge a pull request or publish to production.
