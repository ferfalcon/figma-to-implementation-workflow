#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bootstrapPath = join(root, 'AGENTS-instructions.md');
const repositoryContractPath = join(root, 'AGENTS.md');
const orchestrationPath = join(root, 'workflow', 'Agent-Orchestration.md');
const stateOwnershipPath = join(root, 'workflow', 'State-Ownership.md');
const readmePath = join(root, 'README.md');
const quickstartPath = join(root, 'QUICKSTART.md');
const cliReadmePath = join(root, 'cli', 'README.md');

const bootstrap = readFileSync(bootstrapPath, 'utf8');
const repositoryContract = readFileSync(repositoryContractPath, 'utf8');
const orchestration = readFileSync(orchestrationPath, 'utf8');
const stateOwnership = readFileSync(stateOwnershipPath, 'utf8');
const readme = readFileSync(readmePath, 'utf8');
const quickstart = readFileSync(quickstartPath, 'utf8');
const cliReadme = readFileSync(cliReadmePath, 'utf8');
const errors = [];

if (!bootstrap.includes('[`workflow/Agent-Orchestration.md`](workflow/Agent-Orchestration.md)')) {
  errors.push('Agent bootstrap must delegate to workflow/Agent-Orchestration.md.');
}

if (!bootstrap.includes('design-workflow agent-context --json')) {
  errors.push('Agent bootstrap must contain the canonical agent-context entry command.');
}

if (bootstrap.length > 6000) {
  errors.push(`Agent bootstrap is too large (${bootstrap.length} characters); keep it under 6000 characters.`);
}

const markdownOnlyBoundaryContracts = [
  [
    'README.md',
    readme,
    [
      'The toolkit supports one executable control mode and one manual/scaffold mode:',
      'AI-agent workflow orchestration requires CLI-managed control',
    ],
  ],
  [
    'QUICKSTART.md',
    quickstart,
    [
      'This quickstart covers **CLI-managed workflow execution**, whether the CLI runs locally or through the GitHub/connector-only transport.',
      'Markdown-only is a manual/scaffold mode',
    ],
  ],
  [
    'cli/README.md',
    cliReadme,
    [
      'Markdown-only is a manual/scaffold mode rather than a second executable workflow runtime.',
      'they do not provide executable agent orchestration',
    ],
  ],
  [
    'workflow/State-Ownership.md',
    stateOwnership,
    [
      'The toolkit has one executable control mode and one manual/scaffold mode:',
      'does not provide agent orchestration',
    ],
  ],
  [
    'workflow/Agent-Orchestration.md',
    orchestration,
    [
      'This contract applies to CLI-managed workflow projects.',
      'Markdown-only is a manual/scaffold mode and does not provide executable agent orchestration.',
    ],
  ],
  [
    'AGENTS-instructions.md',
    bootstrap,
    [
      'Markdown-only is a manual/scaffold mode, not an executable agent-orchestration mode.',
      'must not infer or claim current stage/task state',
    ],
  ],
];

for (const [path, content, requiredPhrases] of markdownOnlyBoundaryContracts) {
  for (const phrase of requiredPhrases) {
    if (!content.includes(phrase)) {
      errors.push(`${path} must preserve the Markdown-only manual/scaffold boundary: ${phrase}`);
    }
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
  [/^#\s+Evidence and source control$/im, 'source-authority handbook section'],
  [/^#\s+Design and repository implementation$/im, 'implementation handbook section'],
  [/^#\s+Ownership$/im, 'state-ownership handbook section'],
  [/^#\s+Validation$/im, 'validation handbook section'],
];

for (const [pattern, description] of forbiddenDetailPatterns) {
  if (pattern.test(bootstrap)) {
    errors.push(`Agent bootstrap must delegate ${description} instead of redefining it.`);
  }
}

const requiredGuardrails = [
  [/never manually edit `\.workflow\/workflow-record\.json`/i, 'canonical workflow record remains CLI-owned'],
  [/never manually edit `\.workflow\/generated\/\*`/i, 'generated views remain read-only'],
  [/never self-approve a gate/i, 'human gates cannot be self-approved'],
  [/continuous documentation mode[^\n]*stop before stage 10/i, 'Continuous documentation stops before Stage 10'],
  [/validation check passed[^\n]*ran successfully[^\n]*evidence/i, 'validation success requires executed evidence'],
];

for (const [pattern, description] of requiredGuardrails) {
  if (!pattern.test(bootstrap)) {
    errors.push(`Agent bootstrap is missing safety-critical guardrail: ${description}.`);
  }
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

const forbiddenManualMutationEndorsements = [
  [/after direct record changes/i, 'post-hoc synchronization after direct record mutation'],
  [/intentionally edited outside the CLI/i, 'intentional out-of-band canonical record mutation'],
];

for (const [path, content] of ownershipContracts) {
  for (const [pattern, description] of forbiddenManualMutationEndorsements) {
    if (pattern.test(content)) {
      errors.push(`${path} must not endorse ${description}.`);
    }
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
  console.log(`Agent bootstrap authority test passed (${bootstrap.length} characters; canonical detail remains delegated and Markdown-only remains manual/scaffold only).`);
}
