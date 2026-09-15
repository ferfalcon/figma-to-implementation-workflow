#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const contract = read('workflow/Execution-Transports.md');
for (const phrase of [
  'One engine, multiple transports.',
  'does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json`',
  'Direct execution.',
  'Authorized remote execution.',
  'Do not invent state or substitute manual record edits.',
  'approval evidence separate from command-submission authority',
  'execution transport discovery is a bootstrap/orchestration concern rather than a stage-local conditional resource',
]) {
  assert(contract.includes(phrase), `Execution transport contract must preserve: ${phrase}`);
}

const github = read('workflow/GitHub-Remote-Execution.md');
assert(
  github.includes('The bridge is a transport for the canonical CLI, not a second workflow engine.'),
  'GitHub remote execution must remain a provider transport for the canonical engine.',
);
assert(
  github.includes('Use the local CLI when it is available. Use this bridge only when GitHub is the available execution environment.'),
  'GitHub remote execution must remain subordinate to direct CLI execution when direct execution is available.',
);
assert(
  github.includes('must never edit `.workflow/workflow-record.json` or `.workflow/generated/*` directly'),
  'Remote transport must not become workflow-state authority.',
);

const orchestration = read('workflow/Agent-Orchestration.md');
assert(
  orchestration.includes('The workflow has one canonical engine and multiple possible transports.'),
  'Agent orchestration must preserve the one-engine/multiple-transports model.',
);
assert(
  orchestration.includes('Do not expose local-versus-remote execution as a normal onboarding choice.'),
  'Transport resolution must remain agent-owned rather than a user route-selection question.',
);

const bootstrap = read('AGENTS-instructions.md');
assert(
  bootstrap.includes('[`workflow/Execution-Transports.md`](workflow/Execution-Transports.md)'),
  'Consumer bootstrap must delegate provider-neutral execution transport rules.',
);

const quickstart = read('QUICKSTART.md');
assert(
  quickstart.includes('[Execution Transports](workflow/Execution-Transports.md)'),
  'Quickstart advanced reference must route execution mechanics through the provider-neutral transport contract.',
);

const semantic = JSON.parse(read('workflow/semantic-contract.json'));
assert(
  semantic.domains.some((domain) => domain.id === 'execution-transports'
    && domain.owner === 'workflow/Execution-Transports.md'),
  'Semantic contract must register execution transports under the provider-neutral owner.',
);
assert(
  !semantic.domains.some((domain) => domain.id === 'remote-execution'),
  'Provider-specific GitHub remote execution must no longer be the canonical semantic domain owner.',
);

console.log('Execution transport tests passed (one canonical engine, internal transport resolution, provider delegation, and state/approval boundaries).');
