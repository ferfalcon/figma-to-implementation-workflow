# Product Acceptance

Repository CI, generated application checks, and synthetic fixtures prove important engineering properties, but they do not prove that the product works end to end in ordinary ChatGPT. Product acceptance therefore uses real personal-account sessions to validate the repository-first experience, progressive capability discovery, remote execution, implementation evidence, optional deployment evidence, resume behavior, and human review.

Product acceptance is maintainer QA. It is not a starter-publication gate, a package-release gate, or executable workflow state.

## Candidate preparation

Run the full toolkit validator on Node 22 and 24. Generate the maintained Astro implementation fixture from an exact toolkit commit and run locked installation, Astro/TypeScript checks, production build, and desktop/mobile Playwright through the Validate Astro starter workflow.

Prepare two maintainer-controlled implementation repositories from the same fixture behavior:

1. a repository with no deployment provider configured, to prove that implementation evidence can reach review without runtime evidence;
2. a repository connected to Vercel, to exercise the current deployment adapter and strict commit-bound runtime evidence.

Keep the toolkit commit fixed during each acceptance run so capability, validation, and deployment evidence can be tied to one exact product revision. These repositories are acceptance fixtures, not consumer onboarding prerequisites or distribution assets.

## Two real sessions

Use one designer comfortable with code and one engineer comfortable with Figma, on personal ChatGPT Plus or Pro accounts. Exercise the human-facing **Brief and final review** behavior in one session and **Every stage** in the other. Configuration v3 stores those choices as `brief-and-final` and `every-stage`. Acceptance-report schema v2 also uses the current identifiers while continuing to recognize legacy `brief-and-preview` reports as the same first behavior.

Use ordinary ChatGPT and the existing Figma and GitHub plugins when the workflow requires them. Use the Vercel plugin only in the deployment-required scenario. Do not substitute coding agents, synthetic fixtures, Work, Codex, or a local terminal.

Each tester must begin from the actual product entry point rather than a preconfigured design handoff. Create a fresh ChatGPT Project from [Project-settings--Instructions.md](../Project-settings--Instructions.md), replace only `<REPOSITORY_URL>` with the test implementation repository URL, and do not preload project-specific Figma, review-style, deployment, implementation-root, or working-branch values. Existing provider connections may remain connected; missing connections must be resolved only when the workflow asks for the capability that needs them.

Both sessions must:

1. Start a new chat with `Start the implementation workflow.`
2. Let ChatGPT inspect the repository and establish project context progressively. Provide the Figma design, required authorized Figma scope, and review style only when requested.
3. Verify actual design, repository-write, command-issue, and Actions/native-CI capabilities at the point where the workflow needs each one.
4. Reach working Astro UI, a PR, the exact implementation commit, and successful maintained implementation evidence.
5. Resume from a new chat using repository-owned project configuration, workflow state, the saved branch, and the saved review style without reconstructing the workflow from conversation memory.
6. Request a correction and verify that the replacement commit receives fresh implementation validation before acceptance.
7. Explicitly accept the final result.

The **no-deployment scenario** must additionally prove that:

- no deployment provider is configured for the project;
- deployment inspection is not requested as a global startup capability;
- successful implementation evidence can be reported as ready for human review;
- deployment/runtime evidence is reported as not applicable rather than passed;
- no runtime visual-inspection claim is fabricated.

The **deployment-required scenario** must additionally prove that:

- the deployment capability is verified only when runtime evidence becomes necessary;
- Vercel evidence follows [Deployment-Adapters.md](Deployment-Adapters.md) and [VERCEL.md](../deployment-adapters/VERCEL.md);
- the inspected deployment commit equals the tested implementation commit;
- the provider deployment is usable and the resulting HTTPS runtime is actually inspected;
- a stale alias, wrong commit, non-ready deployment, or uninspectable URL is rejected;
- a corrected implementation commit requires fresh deployment evidence before runtime-dependent acceptance.

Record setup-step count, clarification count, and seconds to the first verified implementation result from the initial workflow command. Record seconds to first verified preview only for the deployment-required scenario. Include capability-connection prompts and progressive-information requests in those observations rather than excluding them as setup outside the product journey. Record failed attempts honestly.

## Record evidence

Use [PRODUCT-ACCEPTANCE.v2.template.json](../templates/PRODUCT-ACCEPTANCE.v2.template.json) as the current report starting point. Schema v2 separates implementation evidence from deployment evidence and records whether deployment evidence was required for each session. The older `PRODUCT-ACCEPTANCE.template.json` is a legacy schema-v1 example and does not satisfy current product acceptance.

A completed v2 report records:

- the exact tested toolkit revision;
- two distinct real testers covering both personas and both review styles;
- conversation and pull-request evidence locators;
- actual capability observations;
- commit-bound implementation validation evidence;
- explicit human acceptance;
- the no-deployment scenario with `deploymentEvidence: null` and no runtime-visual claim;
- the deployment-required scenario with verified normalized deployment evidence and explicit human visual acceptance;
- setup/clarification timing metrics, resume behavior, correction verification, and absence of Work/Codex/local-terminal execution.

Treat the completed report as a maintainer QA record, not canonical workflow state or a runtime input. Retain it only in an appropriate maintainer-controlled evidence location; the toolkit does not require a repository-root acceptance file.

`validateAcceptanceReport()` validates report shape and consistency; it does not call providers or establish authenticity. Maintainers must verify recorded evidence through the actual providers. Automated fixtures never constitute real-user acceptance.

## Evaluate the result

Acceptance evidence is meaningful only for the product behavior and toolkit revision actually exercised. If later changes materially affect onboarding, capability discovery, execution, generated implementation behavior, validation, deployment handling, resume behavior, or human review, rerun the affected real-session scenarios before describing those changes as accepted.

Repository CI remains the regression floor. It must validate core capability evidence, implementation-evidence independence from deployment, commit-bound deployment rules when runtime evidence is required, and the absence of retired publication surfaces. It must not manufacture real-user evidence or turn synthetic fixtures into acceptance.

## Release independence

Toolkit and package releases are versioning/distribution decisions for the toolkit itself. Product acceptance neither publishes an Astro starter nor creates a companion template repository or downloadable consumer project. The maintained Astro fixture remains toolkit-controlled implementation/validation material until the implementation-adapter architecture changes it explicitly.

Acceptance does not merge an implementation PR, create a deployment requirement, or promote a production deployment. Those remain separate human decisions.

The source of the product instructions is [Project-settings--Instructions.md](../Project-settings--Instructions.md); [README.md](../README.md) owns zero-to-start discovery, [QUICKSTART.md](../QUICKSTART.md) provides detailed first-run and resume guidance, and [Deployment-Adapters.md](Deployment-Adapters.md) owns provider-neutral runtime-evidence behavior.
