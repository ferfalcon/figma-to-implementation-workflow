#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const bootstrap = read('AGENTS-instructions.md');
const repositoryContract = read('AGENTS.md');
const orchestration = read('workflow/Agent-Orchestration.md');
const stateOwnership = read('workflow/State-Ownership.md');
const readme = read('README.md');
const quickstart = read('QUICKSTART.md');
const cliReadme = read('cli/README.md');
const errors = [];

if (!bootstrap.includes('[`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md)')) {
  errors.push('Agent bootstrap must delegate to workflow/Agent-Orchestration.md.');
}
if (!bootstrap.includes('design-workflow agent-context --json')) {
  errors.push('Agent bootstrap must contain the canonical initialized agent-context command.');
}
if (bootstrap.length > 7000) {
  errors.push(`Agent bootstrap is too large (${bootstrap.length} characters); keep it under 7000 characters.`);
}

const singleWorkflowBootstrapRequirements = [
  [/human has one workflow entry point/i, 'define one normal human entry point'],
  [/Do not ask whether they are a designer or engineer/i, 'reject persona routing'],
  [/classify the smallest valid profile/i, 'classify profile from project evidence'],
  [/preparation remains outside executable workflow state/i, 'keep design preparation outside formal state'],
  [/Do not ask the human to choose the transport/i, 'resolve direct versus remote execution internally'],
];
for (const [pattern, description] of singleWorkflowBootstrapRequirements) {
  if (!pattern.test(bootstrap)) errors.push(`Agent bootstrap must ${description}.`);
}

const externalBootstrapRequirements = [
  [/loaded from an exact external toolkit revision/i, 'support externally loaded bootstrap instructions'],
  [/relative toolkit reference[^\n]*same repository and exact revision/i, 'resolve relative resources against the pinned toolkit source'],
  [/Do not assume `docs\/implementation-workflow\/` exists/i, 'avoid a vendored-toolkit assumption'],
  [/Install only the thin caller/i, 'install only the remote bridge in consumer repositories'],
  [/Do not copy the toolkit runtime into the implementation repository/i, 'prohibit runtime vendoring'],
];
for (const [pattern, description] of externalBootstrapRequirements) {
  if (!pattern.test(bootstrap)) errors.push(`Agent bootstrap must ${description}.`);
}

const markdownOnlyBoundaryContracts = [
  ['README.md', readme, ['The toolkit supports one executable control mode and one manual/scaffold mode:', 'AI-agent orchestration uses this mode']],
  ['QUICKSTART.md', quickstart, ['Markdown-only is a manual/scaffold mode', 'without executable workflow state, generated routing, or agent orchestration']],
  ['cli/README.md', cliReadme, ['Markdown-only is a manual/scaffold mode rather than a second executable workflow runtime.', 'they do not provide executable agent orchestration']],
  ['workflow/State-Ownership.md', stateOwnership, ['The toolkit has one executable control mode and one manual/scaffold mode:', 'does not provide agent orchestration']],
  ['workflow/Agent-Orchestration.md', orchestration, ['This contract applies to CLI-managed workflow projects.', 'Markdown-only is a manual/scaffold mode and does not provide executable agent orchestration.']],
  ['AGENTS-instructions.md', bootstrap, ['Markdown-only is a manual/scaffold mode, not an executable agent-orchestration mode.', 'must not infer or claim current stage/task state']],
];
for (const [path, content, requiredPhrases] of markdownOnlyBoundaryContracts) {
  for (const phrase of requiredPhrases) {
    if (!content.includes(phrase)) errors.push(`${path} must preserve the Markdown-only manual/scaffold boundary: ${phrase}`);
  }
}

const canonicalHeadings = new Set(
  [...orchestration.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()),
);
const duplicatedHeadings = [...bootstrap.matchAll(/^##\s+(.+)$/gm)]
  .map((match) => match[1].trim())
  .filter((heading) => canonicalHeadings.has(heading));
for (const heading of duplicatedHeadings) {
  errors.push(`Agent bootstrap duplicates canonical orchestration section heading: ${heading}`);
}

const forbiddenDetailPatterns = [
  [/protocolVersion/i, 'protocol-version internals'],
  [/contextProtocolVersion/i, 'context protocol internals'],
  [/protocol\s+v\d+/i, 'protocol-version prose'],
  [/design-workflow\s+context\s+--json/i, 'lower-level diagnostic handshake'],
  [/design-workflow\s+toolkit\s+(show|pin|migrate)/i, 'toolkit-resolution procedure'],
  [/resolution:\s*(embedded|pinned-source-required|migrate-toolkit-binding)/i, 'resource-resolution implementation details'],
];
for (const [pattern, description] of forbiddenDetailPatterns) {
  if (pattern.test(bootstrap)) errors.push(`Agent bootstrap must delegate ${description} instead of redefining it.`);
}

const requiredGuardrails = [
  [/never manually edit `\.workflow\/workflow-record\.json`/i, 'canonical workflow record remains CLI-owned'],
  [/never manually edit `\.workflow\/generated\/\*`/i, 'generated views remain read-only'],
  [/never self-approve a gate/i, 'human gates cannot be self-approved'],
  [/continuous documentation mode[^\n]*stop before stage 10/i, 'Continuous documentation stops before Stage 10'],
  [/validation check passed[^\n]*ran successfully[^\n]*evidence/i, 'validation success requires executed evidence'],
];
for (const [pattern, description] of requiredGuardrails) {
  if (!pattern.test(bootstrap)) errors.push(`Agent bootstrap is missing safety-critical guardrail: ${description}.`);
}

const ownershipContracts = [
  ['AGENTS-instructions.md', bootstrap],
  ['AGENTS.md', repositoryContract],
  ['workflow/State-Ownership.md', stateOwnership],
];
const manualRecordEditProhibitions = [
  /never (manually edit|hand-edit)[^\n]*`\.workflow\/workflow-record\.json`/i,
  /direct edits[^\n]*`\.workflow\/workflow-record\.json`[^\n]*unsupported/i,
];
for (const [path, content] of ownershipContracts) {
  if (!manualRecordEditProhibitions.some((pattern) => pattern.test(content))) {
    errors.push(`${path} must explicitly prohibit direct edits to .workflow/workflow-record.json.`);
  }
}

if (!/`design-workflow sync` is (a )?projection-recovery command, not a record-mutation path/i.test(repositoryContract)) {
  errors.push('AGENTS.md must define design-workflow sync as projection recovery rather than record mutation.');
}
if (!/`design-workflow sync` is not a record-mutation path/i.test(stateOwnership)) {
  errors.push('State-Ownership.md must define design-workflow sync as projection recovery rather than record mutation.');
}

if (errors.length > 0) {
  console.error('Agent bootstrap authority test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Agent bootstrap authority test passed (${bootstrap.length} characters; external pinned loading stays narrow and safety-critical details remain delegated).`);
}
