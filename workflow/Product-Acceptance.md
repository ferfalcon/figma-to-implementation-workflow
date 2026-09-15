# Product Acceptance

Repository CI, generated application checks, and synthetic fixtures prove important engineering properties, but they do not prove that the product works end to end in ordinary ChatGPT. Product acceptance therefore uses real personal-account sessions to validate the repository-first experience, progressive capability discovery, remote execution, preview evidence, resume behavior, and human review.

Product acceptance is maintainer QA. It is not a starter-publication gate, a package-release gate, or executable workflow state.

## Candidate preparation

Run the full toolkit validator on Node 22 and 24. Generate the maintained Astro implementation fixture from an exact toolkit commit and run locked installation, Astro/TypeScript checks, production build, and desktop/mobile Playwright through the Validate Astro starter workflow.

Create a maintainer-controlled test implementation repository from that generated fixture and connect it to Vercel when validating the maintained preview path. Keep the toolkit commit fixed during each acceptance run so capability, validation, and preview evidence can be tied to one exact product revision. The generated Astro project and deployment project are acceptance fixtures; they are not consumer onboarding prerequisites or distribution assets.

## Two real sessions

Use one designer comfortable with code and one engineer comfortable with Figma, on personal ChatGPT Plus or Pro accounts. Exercise Brief and final preview in one session and Every stage in the other. Use ordinary ChatGPT and the existing Figma, GitHub, and Vercel plugins when the workflow requires them. Do not substitute coding agents, synthetic fixtures, Work, Codex, or a local terminal.

Each tester must begin from the actual product entry point rather than a preconfigured design handoff. Create a fresh ChatGPT Project from [Project-settings--Instructions.md](../Project-settings--Instructions.md), replace only `<REPOSITORY_URL>` with the test implementation repository URL, and do not preload project-specific Figma, review-style, deployment, implementation-root, or working-branch values. Existing provider connections may remain connected; missing connections must be resolved only when the workflow asks for the capability that needs them.

Each tester must:

1. Start a new chat in that Project with `Start the implementation workflow.`
2. Let ChatGPT inspect the repository and establish project context progressively. Provide the Figma design, any required authorized Figma scope, and the review style only when requested; allow deployment context to be discovered from the prepared test repository rather than supplied as an initial input.
3. Verify actual design, repository-write, command-issue, Actions-log, and preview capabilities at the point where the workflow needs each one. If a required capability is unavailable, follow the product's normal connection or blocker path rather than bypassing it.
4. Reach working Astro UI, a PR, and a preview matching the tested implementation commit.
5. Review responsiveness, asset loading, navigation, interactions, keyboard use, and visual fidelity against Figma.
6. Resume from a new chat using repository-owned project configuration, workflow state, the saved branch, and the saved review style without reconstructing the workflow from conversation memory.
7. Request a correction, verify the replacement commit and preview, and explicitly accept the result.

Record setup-step count, clarification count, and seconds to first verified preview from the first workflow command. Include capability-connection prompts and progressive-information requests in those observations rather than excluding them as setup outside the product journey. Record failed attempts honestly. Permission, stale-commit, unavailable-asset, and failed-build paths also have automated regression coverage; investigate any additional observed failures before claiming the current product experience is accepted.

## Record evidence

Start from [PRODUCT-ACCEPTANCE.template.json](../templates/PRODUCT-ACCEPTANCE.template.json). Treat the completed report as a maintainer QA record, not canonical workflow state or a runtime input. Retain it only in an appropriate maintainer-controlled evidence location; the toolkit does not require a repository-root acceptance file.

The report records the exact tested toolkit revision, conversation/PR/run/preview locators, actual capability observations, validation outcomes, explicit human visual acceptance, and absence of Work/Codex/local-terminal execution. Preserve private source access: a URL is a locator, not authorization to widen sharing. Never put access tokens, secrets, or private chat contents in the report.

Set status to complete only after both sessions actually pass. `validateAcceptanceReport()` validates the report's shape and consistency; it does not call providers or establish authenticity. Maintainers must verify recorded evidence through the actual providers. Automated fixtures never constitute real-user acceptance.

## Evaluate the result

Acceptance evidence is meaningful only for the product behavior and toolkit revision that were actually exercised. If later changes materially affect onboarding, capability discovery, execution, generated implementation behavior, validation, preview handling, resume behavior, or human review, rerun the affected real-session scenarios before describing those changes as accepted.

Repository CI remains the regression floor. It should validate the acceptance-report schema, capability evidence, commit-bound validation and preview rules, and the absence of retired publication surfaces, but it must not manufacture real-user evidence or turn synthetic fixtures into acceptance.

## Release independence

Toolkit and package releases are versioning/distribution decisions for the toolkit itself. Product acceptance neither publishes an Astro starter nor creates a companion template repository or downloadable consumer project. The maintained Astro fixture remains toolkit-controlled implementation/validation material until the implementation-adapter architecture changes it explicitly.

Acceptance also does not merge an implementation PR or promote a production deployment. Those remain separate human decisions.

The source of the product instructions is [Project-settings--Instructions.md](../Project-settings--Instructions.md); [README.md](../README.md) owns zero-to-start discovery, and [QUICKSTART.md](../QUICKSTART.md) provides detailed first-run and resume guidance.
