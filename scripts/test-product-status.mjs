#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_ACCEPTED_SCENARIOS,
  validateProductStatus,
} from './lib/product-status.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const status = JSON.parse(readFileSync(join(root, 'workflow', 'product-status.json'), 'utf8'));

assert.deepEqual(validateProductStatus(status), { valid: true, findings: [] });
assert.equal(status.status, 'pending', 'The public status must remain pending until real-session evidence is explicitly attested.');
assert.equal(status.lastAcceptedRevision, null);
assert.equal(status.acceptedAt, null);
assert.deepEqual(status.scenarios, []);

const accepted = {
  schemaVersion: 1,
  status: 'accepted',
  lastAcceptedRevision: 'a'.repeat(40),
  acceptedAt: '2026-09-15T23:00:00.000Z',
  acceptanceReportSchemaVersion: 2,
  scenarios: [...REQUIRED_ACCEPTED_SCENARIOS],
};
assert.deepEqual(validateProductStatus(accepted), { valid: true, findings: [] });

for (const alter of [
  value => { value.status = 'passed'; },
  value => { value.lastAcceptedRevision = 'main'; },
  value => { value.acceptedAt = '2026-09-15'; },
  value => { value.scenarios.pop(); },
  value => { value.scenarios.push(value.scenarios[0]); },
  value => { value.conversationUrl = 'https://chatgpt.com/share/private-evidence'; },
]) {
  const invalid = structuredClone(accepted);
  alter(invalid);
  assert.equal(validateProductStatus(invalid).valid, false);
}

const invalidPending = structuredClone(status);
invalidPending.lastAcceptedRevision = 'b'.repeat(40);
assert.equal(validateProductStatus(invalidPending).valid, false);

const readme = readFileSync(join(root, 'README.md'), 'utf8');
assert.match(readme, /workflow\/product-status\.json/, 'README must expose the public product-status attestation.');
assert.match(readme, /workflow\/How-It-Works\.md/, 'README must expose the architecture explainer without expanding the quickstart.');

const quickstart = readFileSync(join(root, 'QUICKSTART.md'), 'utf8');
assert.match(quickstart, /Project-settings--Instructions\.md/);
assert.match(quickstart, /Start the implementation workflow\./);
assert.match(quickstart, /Continue the implementation workflow\./);
assert.match(quickstart, /workflow\/How-It-Works\.md/);

console.log('Product status tests passed (strict non-sensitive attestation shape, pending/accepted semantics, required real-session scenarios, and product-surface discovery).');
