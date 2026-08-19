#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bootstrapPath = join(root, 'AGENTS-instructions.md');
const orchestrationPath = join(root, 'workflow', 'Agent-Orchestration.md');

const bootstrap = readFileSync(bootstrapPath, 'utf8');
const orchestration = readFileSync(orchestrationPath, 'utf8');
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
  [/protocol\s+v[23]/i, 'protocol-version prose'],
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
  'never manually edit `.workflow/generated/*`',
  'never self-approve a gate',
  'Never claim a validation check passed unless it actually ran successfully with evidence.',
];

for (const guardrail of requiredGuardrails) {
  if (!bootstrap.toLowerCase().includes(guardrail.toLowerCase())) {
    errors.push(`Agent bootstrap is missing safety-critical guardrail: ${guardrail}`);
  }
}

if (errors.length > 0) {
  console.error('Agent bootstrap authority test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Agent bootstrap authority test passed (${bootstrap.length} characters; canonical detail remains delegated).`);
}
