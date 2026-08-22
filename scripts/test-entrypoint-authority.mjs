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
  if (!readme.includes(`](${target})`)) {
    errors.push(`README discovery is missing ${target}.`);
  }
}

const requiredProductClaims = [
  [/Figma ↔ GitHub, safely connected through ChatGPT/i, 'lead with the Figma/GitHub bridge'],
  [/One workflow\. One onboarding\. No user route selection\./i, 'state the single-workflow product invariant'],
  [/The workflow is identical in both cases/i, 'keep personas as value lenses rather than workflow routes'],
  [/No local terminal required/i, 'promote no-terminal execution as a first-class feature'],
  [/Start the implementation workflow/i, 'surface the single normal start command'],
  [/Consumer bundle/i, 'document the uploadable consumer package'],
];

for (const [pattern, description] of requiredProductClaims) {
  if (!pattern.test(readme)) errors.push(`README must ${description}.`);
}

const forbiddenReadmeRouting = [
  [/## Choose your entry point/i, 'restore multiple entry-point routing'],
  [/\[I'm a designer\]/i, 'turn the designer persona into a route selector'],
  [/\[I'm an engineer\]/i, 'turn the engineer persona into a route selector'],
  [/choose a profile before initialization/i, 'make profile selection a normal human onboarding choice'],
  [/choose an execution path before initialization/i, 'make transport selection a normal human onboarding choice'],
];

for (const [pattern, description] of forbiddenReadmeRouting) {
  if (pattern.test(readme)) errors.push(`README must not ${description}.`);
}

if (/design-workflow\s+agent-context\s+--json/i.test(readme)) {
  errors.push('README must not become the consumer-agent bootstrap; delegate initialized agent protocol to AGENTS-instructions.md.');
}

if (!quickstart.startsWith('# Quickstart: Start the Implementation Workflow')) {
  errors.push('QUICKSTART must begin with the single workflow start path.');
}

const requiredQuickstartContracts = [
  [/You do \*\*not\*\* need to choose a workflow profile/i, 'remove human profile selection from onboarding'],
  [/decide whether the workflow should run through a local terminal or GitHub Actions/i, 'remove human transport selection from onboarding'],
  [/Copy the contents of `repository\/`/i, 'describe the upload-ready repository payload'],
  [/Connect GitHub and Figma/i, 'connect the two primary project sources'],
  [/ChatGPT-Project-Instructions\.md/i, 'use the generated Project Instructions artifact'],
  [/Start the implementation workflow/i, 'use one normal start command'],
  [/classify the smallest valid workflow profile/i, 'make profile classification agent-owned'],
  [/canonical CLI can run directly or must run through the installed GitHub remote executor/i, 'make execution transport agent-owned'],
  [/Figma preparation is not a separate user workflow route/i, 'integrate preparation without creating another route'],
  [/40-character-toolkit-commit-sha/i, 'preserve immutable consumer caller pinning'],
  [/workflow\/GitHub-Remote-Execution\.md/i, 'delegate remote protocol mechanics to the canonical contract'],
];

for (const [pattern, description] of requiredQuickstartContracts) {
  if (!pattern.test(quickstart)) errors.push(`QUICKSTART must ${description}.`);
}

const forbiddenQuickstartHeadings = [
  /^##\s+\d+\. Choose a profile/im,
  /^##\s+\d+\. Choose an execution path/im,
  /^###\s+Local CLI available/im,
  /^###\s+GitHub\/connector-only execution/im,
];
for (const pattern of forbiddenQuickstartHeadings) {
  if (pattern.test(quickstart)) {
    errors.push(`QUICKSTART must not expose old route-selection heading ${pattern}.`);
  }
}

if (!profiles.includes('profile selection is a workflow responsibility rather than a user-routing question')) {
  errors.push('Workflow-Profiles.md must make AI-assisted profile selection a workflow responsibility.');
}
if (!profiles.includes("User profession, comfort with Figma, comfort with a terminal, or preference for a simpler process must never determine the profile.")) {
  errors.push('Workflow-Profiles.md must explicitly prohibit persona/tooling comfort from determining profile.');
}

const orchestrationRequirements = [
  [/^## One workflow intake$/im, 'define one canonical AI-assisted intake'],
  [/Do not ask "Are you a designer or engineer\?"/i, 'forbid persona route selection'],
  [/^### Pre-initialization profile classification$/im, 'own profile classification before init'],
  [/^### Design-source readiness before the formal audit$/im, 'own preparation readiness without creating a workflow stage'],
  [/^### Execution transport resolution$/im, 'own direct-versus-remote capability resolution'],
  [/Do not expose local-versus-remote execution as a normal onboarding choice/i, 'keep transport internal to orchestration'],
];
for (const [pattern, description] of orchestrationRequirements) {
  if (!pattern.test(orchestration)) errors.push(`Agent-Orchestration.md must ${description}.`);
}

if (!projectSettings.startsWith('# Customize these project values')) {
  errors.push('ChatGPT Project settings must put the small editable value block first.');
}

for (const field of ['Project:', 'Repository:', 'Figma:', 'Figma scope:', 'Implementation root:']) {
  if (!projectSettings.includes(`- ${field}`)) {
    errors.push(`ChatGPT Project settings must expose ${field} in the editable block.`);
  }
}

if (!projectSettings.includes('docs/implementation-workflow/AGENTS-instructions.md')) {
  errors.push('ChatGPT Project settings must delegate workflow execution to the vendored consumer-agent bootstrap.');
}
if (!projectSettings.includes('one workflow regardless of whether my strongest discipline is design or engineering')) {
  errors.push('ChatGPT Project settings must preserve one workflow across user backgrounds.');
}
if (!/do not redefine them in these Project instructions/i.test(projectSettings)) {
  errors.push('ChatGPT Project settings must keep workflow mechanics delegated.');
}

const forbiddenProjectWorkflowDetails = [
  [/design-workflow\s+agent-context\s+--json/i, 'the canonical CLI bootstrap command'],
  [/recordGitBlobSha/i, 'record/projection freshness internals'],
  [/design-workflow\s+sync/i, 'projection-recovery commands'],
  [/GitHub-Remote-Execution\.md/i, 'remote-execution protocol routing'],
  [/design-workflow-command\.yml/i, 'remote-executor installation details'],
];
for (const [pattern, description] of forbiddenProjectWorkflowDetails) {
  if (pattern.test(projectSettings)) {
    errors.push(`ChatGPT Project settings must delegate ${description} to the consumer bootstrap.`);
  }
}

const implementationRootRequirements = [
  [/Treat `<IMPLEMENTATION_ROOT>` as the repo-relative implementation boundary/i, 'define Implementation root as a repository-relative implementation boundary'],
  [/`\.` for repo root; e\.g\. `frontend\/` or `apps\/web\/` when nested/i, 'document root and nested examples'],
  [/scope app code inspection, edits, app-specific commands, architecture, and validation to it/i, 'scope implementation work to Implementation root'],
  [/Go outside it only for required repo-wide integration/i, 'limit outside-root work to required integration'],
  [/Instruction files may be read outside it without expanding the edit boundary/i, 'allow governing instructions outside the edit boundary'],
];
for (const [pattern, description] of implementationRootRequirements) {
  if (!pattern.test(projectSettings)) errors.push(`ChatGPT Project settings must ${description}.`);
}

if (projectSettings.length > 8000) {
  errors.push(`ChatGPT Project settings exceed the 8000-character host limit (${projectSettings.length} characters).`);
}

if (!toolkitAgents.includes('# Repository Guidelines')) {
  errors.push('AGENTS.md must remain the toolkit repository-development contract.');
}
if (!consumerAgents.includes('# Agent bootstrap contract')) {
  errors.push('AGENTS-instructions.md must remain the implementation-project consumer bootstrap.');
}
if (!consumerAgents.includes('Do not ask whether they are a designer or engineer')) {
  errors.push('AGENTS-instructions.md must reject persona-based workflow routing.');
}
if (!consumerAgents.includes('Do not ask the human to choose the transport')) {
  errors.push('AGENTS-instructions.md must resolve CLI versus GitHub transport automatically.');
}

const remoteExecutionRequirements = [
  [/^### Remote-only first run$/im, 'define an explicit remote-only first-run procedure'],
  [/caller installation is \*\*step zero\*\*/i, 'treat caller installation as pre-initialization setup'],
  [/default branch/i, 'require the caller on the repository default branch'],
  [/target branch[\s\S]*expectedHead/i, 'refresh target-branch HEAD after repository setup'],
  [/remote `init`/i, 'use the canonical remote init transition'],
  [/recordGitBlobSha/i, 'verify the regenerated projection after initialization'],
];
for (const [pattern, description] of remoteExecutionRequirements) {
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
  console.log('Entrypoint authority test passed (one human workflow, agent-owned profile/transport resolution, uploadable setup, and delegated safety contracts).');
}
