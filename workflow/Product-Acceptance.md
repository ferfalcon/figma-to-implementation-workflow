# Product Acceptance and Publication

A validated engine or generated starter is not proof that the product works in ordinary ChatGPT. Public starter assets and the companion template remain gated until two real personal-account sessions pass.

## Candidate preparation

Run the full toolkit validator on Node 22 and 24. Build the generated Astro starter from an exact commit and run locked installation, astro check, build, and desktop/mobile Playwright on both Node versions through the Validate Astro starter workflow. Its candidate ZIP is a test artifact, not a public release.

Create a test implementation repository from that generated bundle and connect it to Vercel. Keep the toolkit commit fixed during acceptance.

## Two real sessions

Use one designer comfortable with code and one engineer comfortable with Figma, on personal ChatGPT Plus or Pro accounts. Exercise Brief and final preview in one session and Every stage in the other. Use ordinary ChatGPT and its existing Figma, GitHub, and Vercel plugins. Do not substitute coding agents, synthetic fixtures, Work, Codex, or a local terminal.

Each tester must:

1. Complete browser setup and start with a Figma Design link.
2. Verify actual design, repository-write, command-issue, Actions-log, and preview capabilities.
3. Reach working Astro UI, a PR, and a preview matching the tested implementation commit.
4. Review responsiveness, asset loading, navigation, interactions, keyboard use, and visual fidelity against Figma.
5. Resume from a new chat using the saved branch and review style.
6. Request a correction, verify the replacement commit and preview, and explicitly accept the result.

Record setup-step count, clarification count, and seconds to first verified preview. Record failed attempts honestly. Permission, stale-commit, unavailable-asset, and failed-build paths also have automated regression coverage; investigate any additional observed failures before publication.

## Record evidence

Start from [PRODUCT-ACCEPTANCE.template.json](../templates/PRODUCT-ACCEPTANCE.template.json). Add a distinct session for each real tester and populate [release/acceptance.json](../release/acceptance.json) only from observed evidence. Preserve private source access: a URL is a locator, not authorization to widen sharing. Never put access tokens, secrets, or private chat contents in the report.

The report records the exact tested toolkit revision, conversation/PR/run/preview locators, actual capability observations, validation outcomes, explicit human visual acceptance, and absence of Work/Codex/local-terminal execution. Set status to complete only after both sessions actually pass.

Commit the completed report in a separate commit after the tested revision. The release guard permits only this report file to differ from the tested source. Any other source change requires new acceptance evidence. Retain full Git history in release jobs.

Run npm run check:release-readiness with the intended release revision. The guard rejects pending/malformed evidence, missing personas/styles, reused tester identities, failed or stale validation, mismatched preview commits, missing assets, and source changes after acceptance. It checks recorded evidence; maintainers must verify its authenticity through the actual providers. Automated fixtures never constitute acceptance.

## Publish after acceptance

Use a new release only after repository CI, generated-starter CI, the actual preview inspections, and the release guard pass. Package metadata remains unchanged until the maintainer intentionally selects a release version.

Configure STARTER_TEMPLATE_REPOSITORY as the companion owner/name and STARTER_PUBLISH_TOKEN as a repository secret for a narrowly scoped publisher account with permission to create/update that template and its workflow files. The publisher generates all template files from the exact released toolkit revision. Do not maintain a second source copy by hand.

The release workflow checks acceptance, runs toolkit and starter verification, generates bundles, updates the companion template, and uploads the public release assets. Without valid acceptance or publisher configuration, it stops before publishing assets. Preview acceptance never authorizes merging an implementation PR or promoting a production deployment.

The source of the product instructions remains [AI-project-settings.md](../AI-project-settings.md); [QUICKSTART.md](../QUICKSTART.md) remains the single user onboarding guide.
