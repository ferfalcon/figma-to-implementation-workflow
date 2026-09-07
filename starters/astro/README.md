# Your Astro project

This is the maintained Astro + TypeScript starter for the Design-to-Implementation Workflow. Fieldnotes is sample content used to verify the starting project; it is not an implementation of your Figma file.

Follow the single [workflow quickstart](https://github.com/ferfalcon/figma-to-implementation-workflow/blob/<TOOLKIT_REVISION>/QUICKSTART.md). Your generated repository includes a pinned workflow caller and ChatGPT-Project-Instructions.md. Copy those instructions into an ordinary ChatGPT Project, set your repository locator, and start with your Figma link. ChatGPT creates design-workflow.config.json after you choose your review style.

Connect this repository to Vercel once. Implementation branch pushes create preview deployments. The default working branch is design/initial-ui; production changes require a separate merge.

## Work through ChatGPT

Use Figma, GitHub, and Vercel plugins. Ask to start, continue, correct the preview, or show progress. Work and Codex are not part of this flow. The source, review preference, working branch, and workflow progress are saved in the repository.

The Validate UI workflow installs the lockfile, checks types, builds the site, and tests the production output in desktop and mobile Chromium. Read its VALIDATION_RESULT log entry to find the tested commit. Only compare a Vercel preview for that same commit. Automated checks and human visual acceptance are separate.

Keep your design assets in public/ or src/. Temporary Figma export URLs must not become runtime dependencies. Upload unavailable exports through GitHub's browser interface during setup.

## Optional local development

Node 24 and npm are the maintained local environment.

- npm ci — install the locked dependencies.
- npm run dev — start local development.
- npm run check — check Astro and TypeScript.
- npm run build — build static output.
- npx --no-install playwright install chromium — install the test browser.
- npm run test:e2e — test the production build.
- PREVIEW_URL=https://your-preview.vercel.app npm run test:e2e — test an accessible deployed preview.

Replace sample pages, styles, and sample-specific expectations with the approved design requirements. Keep navigation, keyboard, asset, responsive, and accessibility coverage meaningful as the UI evolves.
