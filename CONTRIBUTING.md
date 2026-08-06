# Contributing

Contributions should improve the workflow without weakening evidence, accessibility, proportionality, source integrity, or honest validation.

## Before proposing a change

1. Read [`workflow/Design-Implementation-Workflow.md`](workflow/Design-Implementation-Workflow.md).
2. Identify which artifact owns the decision.
3. Check whether the change is normative guidance, a template, an adapter, a prompt, an example, or validation tooling.
4. Preserve existing identifier and snapshot semantics.
5. Avoid adding a new document when an existing owner can express the concern clearly.

## Repository conventions

- Normative process rules belong in `workflow/`.
- Source-format inspection rules belong in `source-adapters/`.
- Artifact-writing guidance belongs in `guidelines/`.
- Reusable project artifact structures belong in `templates/`.
- Stage-specific executable instructions belong in `prompts/`.
- Non-normative demonstrations belong in `examples/`.
- Repository checks belong in `scripts/`.

## Quality expectations

Changes should:

- distinguish confirmed, observed, inferred, recommended, and open information;
- avoid inventing product or technical decisions from design evidence;
- preserve accessibility as integrated work;
- avoid arbitrary breakpoints and unsupported focus behavior;
- keep current, target, and transitional states distinct;
- define validation without claiming unexecuted checks passed;
- preserve backwards traceability when identifiers or source snapshots change.

## Validation

Run:

```bash
node scripts/validate-workflow.mjs
```

The command must pass before a structural or link change is considered complete.

Also perform two review passes:

1. completeness and correctness;
2. consistency, traceability, source integrity, risks, and uncertainty after corrections.

## Pull requests

Explain:

- what changed;
- why it belongs in the selected repository area;
- affected workflow stages and artifacts;
- compatibility or migration impact;
- validation performed;
- remaining risks or follow-up work.

Examples must remain explicitly non-normative.
