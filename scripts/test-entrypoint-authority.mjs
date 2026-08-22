#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const readme = read('README.md');
const quickstart = read('QUICKSTART.md');
const projectSettings = read('AI-project-settings.md');
const toolkitAgents = read('AGENTS.md');
const consumerAgents = read('AGENTS-instructions.md');
const figmaLauncher = read('AGENTS-PROMPT-Figma-file-preparation.md');
const orchestration = read('workflow/Agent-Orchestration.md');
const profiles = read('workflow/Workflow-Profiles.md');
const remoteExecution = read('workflow/GitHub-Remote-Execution.md');
const errors = [];

const requiredReadmeLinks = [
  'QUICKSTART.md',
  'workflow/Design-Implementation-Workflow.md',
  'workflow/Workflow-Profiles.md',
  'workflow/Agent-Orchestration.md',
  'workflow/GitHub-Remote-Execution.md',
  'AGENTS-instructions.md',
  'AI-project-settings.md',
  'AGENTS-PROMPT-Figma-file-preparation.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'cli/README.md',
  'schemas/README.md',
];
for (const target of requiredReadmeLinks) {
  if (!readme.includes(`](${target})`)) errors.push(`README discovery is missing ${target}.`);
}

const requiredProductClaims = [
  [/Figma ↔ GitHub, safely connected through ChatGPT/i, 'lead with the Figma/GitHub bridge'],
  [/One workflow\. One onboarding\. No user route selection\./i, 'state the single-workflow product invariant'],
  [/The workflow is identical in both cases/i, 'keep personas as value lenses rather than routes'],
  [/No local terminal required/i, 'promote no-terminal execution'],
  [/Install the Design-to-Implementation Workflow in this repository/i, 'make ChatGPT-owned installation discoverable'],
  [/Start the implementation workflow/i, 'surface the single workflow entry point'],
  [/External pinned toolkit model/i, 'document dependency authority'],
  [/Consumer bundle/i, 'retain the thin manual fallback'],
];
for (const [pattern, description] of requiredProductClaims) {
  if (!pattern.test(readme)) errors.push(`README must ${description}.`);
}

const forbiddenReadmeRouting = [
  [/## Choose your entry point/i, 'restore multiple entry-point routing'],
  [/\[I'm a designer\]/i, 'turn designer persona into a route selector'],
  [/\[I'm an engineer\]/i, 'turn engineer persona into a route selector'],
  [/choose a profile before initialization/i, 'make profile selection a human onboarding choice'],
  [/choose an execution path before initialization/i, 'make transport selection a human onboarding choice'],
];
for (const [pattern, description] of forbiddenReadmeRouting) {
  if (pattern.test(readme)) errors.push(`README must not ${description}.`);
}
if (/design-workflow\s+agent-context\s+--json/i.test(readme)) {
  errors.push('README must not become the consumer-agent runtime bootstrap.');
}
if (/docs\/implementation-workflow\/AGENTS-instructions\.md/i.test(readme)) {
  errors.push('README must not require a vendored consumer-agent bootstrap.');
}

if (!quickstart.startsWith('# Quickstart: Start the Implementation Workflow')) {
  errors.push('QUICKSTART must begin with the single workflow start path.');
}

const requiredQuickstartContracts = [
  [/You do \*\*not\*\* need to choose a workflow profile/i, 'remove human profile selection'],
  [/decide whether the workflow should run through a local terminal or GitHub Actions/i, 'remove human transport selection'],
  [/Install the Design-to-Implementation Workflow in this repository/i, 'make installation an agent-owned setup action'],
  [/setup action, not a second workflow route/i, 'keep installation separate from workflow routing'],
  [/resolve[^\n]*default-branch HEAD once[^\n]*exact 40-character/i, 'resolve a mutable bootstrap ref only once into an immutable pin'],
  [/does \*\*not\*\* receive a copied `docs\/implementation-workflow\/` toolkit tree/i, 'reject vendored toolkit installation'],
  [/installed caller's exact revision is the bootstrap identity/i, 'define pre-init pin authority'],
  [/workflow-record\.json` owns the canonical toolkit binding/i, 'define initialized pin authority'],
  [/GitHub for the implementation repository/i, 'connect GitHub as repository source'],
  [/Figma for design inspection and authorized design changes/i, 'connect Figma as design source'],
  [/Start the implementation workflow/i, 'use one workflow start command'],
  [/classify the smallest valid workflow profile/i, 'make profile classification agent-owned'],
  [/canonical CLI can run directly or must run through the installed GitHub remote executor/i, 'make transport agent-owned'],
  [/Figma preparation is not a separate user workflow route/i, 'integrate preparation without another route'],
  [/Manual fallback: thin consumer bundle/i, 'retain a no-vendoring manual fallback'],
  [/npm install --save-dev github:ferfalcon\/figma-to-implementation-workflow#<40-character-toolkit-commit-sha>/i, 'document optional direct GitHub package installation'],
];
for (const [pattern, description] of requiredQuickstartContracts) {
  if (!pattern.test(quickstart)) errors.push(`QUICKSTART must ${description}.`);
}

for (const pattern of [
  /^##\s+\d+\. Choose a profile/im,
  /^##\s+\d+\. Choose an execution path/im,
  /^###\s+Local CLI available/im,
  /^###\s+GitHub\/connector-only execution/im,
]) {
  if (pattern.test(quickstart)) errors.push(`QUICKSTART must not expose route-selection heading ${pattern}.`);
}

if (!profiles.includes('profile selection is a workflow responsibility rather than a user-routing question')) {
  errors.push('Workflow-Profiles.md must make AI-assisted profile selection a workflow responsibility.');
}
if (!profiles.includes('User profession, comfort with Figma, comfort with a terminal, or preference for a simpler process must never determine the profile.')) {
  errors.push('Workflow-Profiles.md must prohibit persona/tooling comfort from determining profile.');
}

for (const [pattern, description] of [
  [/^## One workflow intake$/im, 'define one canonical AI-assisted intake'],
  [/Do not ask "Are you a designer or engineer\?"/i, 'forbid persona route selection'],
  [/^### Pre-initialization profile classification$/im, 'own profile classification before init'],
  [/^### Design-source readiness before the formal audit$/im, 'own preparation readiness'],
  [/^### Execution transport resolution$/im, 'own direct-versus-remote resolution'],
  [/Do not expose local-versus-remote execution as a normal onboarding choice/i, 'keep transport internal'],
]) {
  if (!pattern.test(orchestration)) errors.push(`Agent-Orchestration.md must ${description}.`);
}

if (!projectSettings.startsWith('# Customize these project values')) {
  errors.push('ChatGPT Project settings must put the small editable value block first.');
}
for (const field of ['Project:', 'Repository:', 'Figma:', 'Figma scope:', 'Implementation root:']) {
  if (!projectSettings.includes(`- ${field}`)) errors.push(`ChatGPT Project settings must expose ${field}.`);
}

const projectBootstrapRequirements = [
  [/external pinned dependency/i, 'define the toolkit as an external pinned dependency'],
  [/canonical bootstrap repository is `ferfalcon\/figma-to-implementation-workflow`/i, 'identify the canonical bootstrap repository'],
  [/do not look for a vendored `docs\/implementation-workflow\/` toolkit/i, 'reject the old vendored bootstrap'],
  [/\.github\/workflows\/design-workflow-command\.yml/i, 'inspect the known thin caller before init'],
  [/current default-branch HEAD once to an exact 40-character SHA/i, 'resolve a missing bootstrap pin deterministically'],
  [/Load `AGENTS-instructions\.md`[^\n]*exactly that bootstrap revision/i, 'load the bootstrap from the immutable source'],
  [/one workflow regardless of whether my strongest discipline is design or engineering/i, 'preserve one workflow across user backgrounds'],
  [/do not redefine them in these Project instructions/i, 'keep detailed workflow mechanics delegated'],
];
for (const [pattern, description] of projectBootstrapRequirements) {
  if (!pattern.test(projectSettings)) errors.push(`ChatGPT Project settings must ${description}.`);
}
if (/docs\/implementation-workflow\/AGENTS-instructions\.md/i.test(projectSettings)) {
  errors.push('ChatGPT Project settings must not delegate to a vendored bootstrap path.');
}

for (const [pattern, description] of [
  [/Treat `<IMPLEMENTATION_ROOT>` as the repo-relative implementation boundary/i, 'define Implementation root'],
  [/`\.` for repo root; e\.g\. `frontend\/` or `apps\/web\/` when nested/i, 'document root and nested examples'],
  [/scope app code inspection, edits, app-specific commands, architecture, and validation to it/i, 'scope implementation work'],
  [/Go outside it only for required repo-wide integration/i, 'limit outside-root work'],
  [/Instruction files may be read outside it without expanding the edit boundary/i, 'allow instruction reads outside edit boundary'],
]) {
  if (!pattern.test(projectSettings)) errors.push(`ChatGPT Project settings must ${description}.`);
}
if (projectSettings.length > 8000) {
  errors.push(`ChatGPT Project settings exceed the 8000-character host limit (${projectSettings.length} characters).`);
}

if (!toolkitAgents.includes('# Repository Guidelines')) errors.push('AGENTS.md must remain toolkit development authority.');
if (!consumerAgents.includes('# Agent bootstrap contract')) errors.push('AGENTS-instructions.md must remain consumer bootstrap authority.');
if (!consumerAgents.includes('Do not ask whether they are a designer or engineer')) errors.push('Consumer bootstrap must reject persona routing.');
if (!consumerAgents.includes('Do not ask the human to choose the transport')) errors.push('Consumer bootstrap must resolve transport automatically.');
if (!consumerAgents.includes('Do not assume `docs/implementation-workflow/` exists')) errors.push('Consumer bootstrap must support external pinned loading.');
if (!consumerAgents.includes('Do not copy the toolkit runtime into the implementation repository.')) errors.push('Consumer bootstrap must prohibit runtime vendoring during remote install.');

for (const [pattern, description] of [
  [/^### Remote-only first run$/im, 'define remote-only first run'],
  [/caller installation is \*\*step zero\*\*/i, 'treat caller install as pre-init setup'],
  [/default branch/i, 'require caller on default branch'],
  [/remote `init`/i, 'use canonical remote init'],
  [/recordGitBlobSha/i, 'verify regenerated projection after init'],
]) {
  if (!pattern.test(remoteExecution)) errors.push(`GitHub-Remote-Execution.md must ${description}.`);
}

if (!figmaLauncher.includes('single normative procedure')) {
  errors.push('Figma preparation launcher must identify one canonical preparation owner.');
}

if (errors.length > 0) {
  console.error('Entrypoint authority test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Entrypoint authority test passed (one workflow entry point, agent-owned external bootstrap, no vendored toolkit requirement, and delegated safety contracts).');
}
