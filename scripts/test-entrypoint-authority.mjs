#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const semanticContract = JSON.parse(read('workflow/semantic-contract.json'));
const readme = read('README.md');
const quickstart = read('QUICKSTART.md');
const projectSettings = read('AI-project-settings.md');
const toolkitAgents = read('AGENTS.md');
const consumerAgents = read('AGENTS-instructions.md');
const figmaLauncher = read('AGENTS-PROMPT-Figma-file-preparation.md');
const orchestration = read('workflow/Agent-Orchestration.md');
const projectConfiguration = read('workflow/Project-Configuration.md');
const profiles = read('workflow/Workflow-Profiles.md');
const remoteExecution = read('workflow/GitHub-Remote-Execution.md');
const errors = [];

const entrypoint = (id) => {
  const found = semanticContract.entrypoints?.find((candidate) => candidate.id === id);
  if (!found) errors.push(`Semantic contract is missing entrypoint ${id}.`);
  return found;
};

const requireDelegatedLinks = (label, source, owner) => {
  for (const target of owner?.delegatesTo ?? []) {
    if (!source.includes(`](${target})`)) {
      errors.push(`${label} must link delegated contract ${target} from workflow/semantic-contract.json.`);
    }
  }
};

const readmeEntrypoint = entrypoint('readme');
const quickstartEntrypoint = entrypoint('quickstart');
const projectSettingsEntrypoint = entrypoint('chatgpt-project-settings');
const productModel = semanticContract.productModel;

if (readmeEntrypoint?.path !== 'README.md') {
  errors.push('Semantic contract readme entrypoint must own README.md.');
}
if (quickstartEntrypoint?.path !== 'QUICKSTART.md') {
  errors.push('Semantic contract quickstart entrypoint must own QUICKSTART.md.');
}
if (projectSettingsEntrypoint?.path !== 'AI-project-settings.md') {
  errors.push('Semantic contract ChatGPT Project settings entrypoint must own AI-project-settings.md.');
}

requireDelegatedLinks('README', readme, readmeEntrypoint);
requireDelegatedLinks('QUICKSTART', quickstart, quickstartEntrypoint);

if (!productModel?.bootstrap) {
  errors.push('Semantic contract must define productModel.bootstrap for entrypoint validation.');
} else {
  const { bootstrap } = productModel;
  if (typeof bootstrap.startCommand !== 'string' || bootstrap.startCommand.length === 0) {
    errors.push('Semantic contract productModel.bootstrap.startCommand must be non-empty.');
  } else {
    if (!readme.includes(bootstrap.startCommand)) {
      errors.push('README must expose the canonical start command from workflow/semantic-contract.json.');
    }
    if (!quickstart.includes(bootstrap.startCommand)) {
      errors.push('QUICKSTART must expose the canonical start command from workflow/semantic-contract.json.');
    }
  }

  for (const input of bootstrap.requiredInitialInputs ?? []) {
    const registeredHost = semanticContract.entrypoints?.find((candidate) => candidate.path === input.host);
    if (!registeredHost) {
      errors.push(`Initial input ${input.id} host ${input.host} must be a registered semantic entrypoint.`);
      continue;
    }

    let hostSource;
    try {
      hostSource = read(input.host);
    } catch {
      errors.push(`Initial input ${input.id} host ${input.host} must exist.`);
      continue;
    }

    if (input.placeholder && !hostSource.includes(input.placeholder)) {
      errors.push(`Initial input ${input.id} host ${input.host} must expose placeholder ${input.placeholder}.`);
    }
    if (input.placeholder && !readme.includes(input.placeholder)) {
      errors.push(`README must expose initial-input placeholder ${input.placeholder} from workflow/semantic-contract.json.`);
    }
    if (input.placeholder && !quickstart.includes(input.placeholder)) {
      errors.push(`QUICKSTART must expose initial-input placeholder ${input.placeholder} from workflow/semantic-contract.json.`);
    }
  }
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

if (!quickstart.startsWith('# Quickstart')) {
  errors.push('QUICKSTART must begin with a Quickstart heading.');
}

for (const pattern of [
  /^##\s+\d+\. Choose a profile/im,
  /^##\s+\d+\. Choose an execution path/im,
  /^###\s+Local CLI available/im,
  /^###\s+GitHub\/connector-only execution/im,
]) {
  if (pattern.test(quickstart)) errors.push(`QUICKSTART must not expose route-selection heading ${pattern}.`);
}

// Technical setup rules belong to the pinned bootstrap and CLI reference.
const advancedContracts = [
  [projectSettings, /current default-branch HEAD once to an exact 40-character SHA/i, 'immutable bootstrap resolution'],
  [consumerAgents, /Do not copy the toolkit runtime into the implementation repository\./, 'external toolkit ownership'],
  [remoteExecution, /installed caller.*revision|caller.*bootstrap/is, 'pre-init caller identity'],
  [consumerAgents, /workflow-record\.json/, 'canonical initialized state'],
  [orchestration, /smallest valid workflow profile/i, 'agent-owned profile selection'],
  [orchestration, /Execution transport resolution/i, 'agent-owned transport resolution'],
  [read('cli/README.md'), /npm install --save-dev github:ferfalcon\/figma-to-implementation-workflow#<40-character-toolkit-commit-sha>/i, 'optional direct GitHub installation'],
];
for (const [source, pattern, description] of advancedContracts) {
  if (!pattern.test(source)) errors.push('Missing delegated contract: ' + description);
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
  [/design-workflow\.config\.json/i, 'load repository-owned project configuration before intake'],
]) {
  if (!pattern.test(orchestration)) errors.push(`Agent-Orchestration.md must ${description}.`);
}

if (!projectSettings.startsWith('# Project locator')) {
  errors.push('ChatGPT Project settings must begin with the repository bootstrap locator.');
}
for (const placeholder of ['<PROJECT_NAME>', '<FIGMA_URL>', '<FIGMA_SCOPE>', '<IMPLEMENTATION_ROOT>', '<VERCEL_URL>', '<PRODUCTION_URL>']) {
  if (projectSettings.includes(placeholder)) errors.push(`ChatGPT Project settings must not duplicate repository-owned project configuration placeholder ${placeholder}.`);
}
if (!projectSettings.includes('design-workflow.config.json') || !projectSettings.includes('workflow/Project-Configuration.md')) {
  errors.push('ChatGPT Project settings must delegate stable project configuration to the repository manifest contract.');
}
if (!projectConfiguration.includes('canonical, version-controlled project configuration')) {
  errors.push('Project-Configuration.md must define the repository manifest as canonical persistent project configuration.');
}
if (!projectConfiguration.includes('only a bootstrap pointer')) {
  errors.push('Project-Configuration.md must distinguish the host repository locator from configuration authority.');
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
  [/design-workflow\.config\.json` exists and is verified/i, 'require project configuration before first initialization'],
];
for (const [pattern, description] of projectBootstrapRequirements) {
  if (!pattern.test(projectSettings)) errors.push(`ChatGPT Project settings must ${description}.`);
}
if (/docs\/implementation-workflow\/AGENTS-instructions\.md/i.test(projectSettings)) {
  errors.push('ChatGPT Project settings must not delegate to a vendored bootstrap path.');
}

for (const [pattern, description] of [
  [/repository\.implementationRoot/i, 'read Implementation root from project configuration'],
  [/`\.` for repo root; e\.g\. `frontend\/` or `apps\/web\/` when nested/i, 'document root and nested examples'],
  [/scope app code inspection, edits, app-specific commands, architecture, and validation to it/i, 'scope implementation work'],
  [/Go outside it only for required repo-wide integration/i, 'limit outside-root work'],
  [/Instruction files may be read outside it without expanding the edit boundary/i, 'allow instruction reads outside edit boundary'],
  [/configuration `design\.scope`/i, 'read Figma edit scope from project configuration'],
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
if (!consumerAgents.includes('design-workflow.config.json') || !consumerAgents.includes('workflow/Project-Configuration.md')) errors.push('Consumer bootstrap must load repository-owned project configuration.');

for (const [pattern, description] of [
  [/^### Remote-only first run$/im, 'define remote-only first run'],
  [/caller installation is \*\*step zero\*\*/i, 'treat caller install as pre-init setup'],
  [/design-workflow\.config\.json/i, 'require repository-owned project configuration before remote init'],
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
  console.log('Entrypoint authority test passed (semantic entrypoint delegation, product bootstrap, repository-owned project configuration, and agent-owned safety contracts).');
}
