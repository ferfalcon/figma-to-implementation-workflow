# Your Astro project

This project uses the maintained Astro + TypeScript implementation scaffold from the Design-to-Implementation Workflow. Fieldnotes is sample content used to verify the baseline application; it is not an implementation of your Figma file.

The scaffold supplies the application structure and validation baseline only. Workflow configuration, the pinned GitHub command bridge, ChatGPT Project instructions, design context, review preferences, and deployment configuration are established separately by the repository-first workflow when they become necessary.

## Work through ChatGPT

GitHub is the project bootstrap. Ask ChatGPT to start or continue the implementation workflow from the repository URL. Connect Figma when design inspection becomes necessary and a deployment provider when preview evidence is needed. The source, review preference, working branch, and workflow progress are stored in repository-owned configuration and workflow state rather than this scaffold.

The Validate UI workflow installs the lockfile, checks types, builds the site, and tests the production output in desktop and mobile Chromium. Read its `VALIDATION_RESULT` log entry to find the tested commit. Only compare a deployment preview for that same commit. Automated checks and human visual acceptance remain separate.

Keep required design assets in `public/` or `src/`. Temporary Figma export URLs must not become runtime dependencies. Upload unavailable exports through an authorized repository path when they become necessary.

## Optional local development

Node 24 and npm are the maintained local environment.

- `npm ci` — install the locked dependencies.
- `npm run dev` — start local development.
- `npm run check` — check Astro and TypeScript.
- `npm run build` — build static output.
- `npx --no-install playwright install chromium` — install the test browser.
- `npm run test:e2e` — test the production build.
- `PREVIEW_URL=https://your-preview.example npm run test:e2e` — test an accessible deployed preview.

Replace sample pages, styles, and sample-specific expectations with the approved design requirements. Keep navigation, keyboard, asset, responsive, and accessibility coverage meaningful as the UI evolves.
