#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtimeEvidencePath = join(root, 'cli', 'lib', 'evidence.mjs');
const obsoleteMixedPath = join(root, 'cli', 'lib', 'product-evidence.mjs');
const acceptancePath = join(root, 'scripts', 'lib', 'product-acceptance.mjs');

assert(existsSync(runtimeEvidencePath), 'Runtime CLI must expose generic evidence primitives.');
assert(!existsSync(obsoleteMixedPath), 'The mixed cli/lib/product-evidence.mjs boundary must stay deleted.');
assert(existsSync(acceptancePath), 'Maintainer product acceptance validation must stay source-only under scripts/lib/.');

const runtimeEvidenceSource = readFileSync(runtimeEvidencePath, 'utf8');
for (const productSpecificToken of [
  'ordinary-chatgpt',
  'validateAcceptanceReport',
  'assessCapabilities',
  'assessPreviewEvidence',
  'conversationUrl',
  'usedCodex',
  'usedWork',
  'personal Plus or Pro',
  'MAINTAINED_ASTRO_CHECKS',
]) {
  assert(
    !runtimeEvidenceSource.includes(productSpecificToken),
    `Generic runtime evidence must not contain ChatGPT product-acceptance concern: ${productSpecificToken}`,
  );
}

const runtimeEvidence = await import('../cli/lib/evidence.mjs');
assert.deepEqual(
  Object.keys(runtimeEvidence).sort(),
  ['assessDeploymentEvidence', 'assessImplementationEvidence', 'assessReviewEvidence'].sort(),
  'Runtime evidence module must expose only provider-neutral evidence primitives.',
);

const acceptanceSource = readFileSync(acceptancePath, 'utf8');
assert(
  acceptanceSource.includes("from '../../cli/lib/evidence.mjs'"),
  'Product acceptance must reuse generic runtime evidence instead of duplicating it.',
);
for (const acceptanceConcern of ['assessCapabilities', 'validateAcceptanceReport', 'ordinary-chatgpt']) {
  assert(
    acceptanceSource.includes(acceptanceConcern),
    `Source-only product acceptance must own ${acceptanceConcern}.`,
  );
}

const acceptance = await import('./lib/product-acceptance.mjs');
for (const exportName of [
  'REQUIRED_CAPABILITIES',
  'DEPLOYMENT_INSPECTION_CAPABILITY',
  'MAINTAINED_ASTRO_CHECKS',
  'assessCapabilities',
  'assessPreviewEvidence',
  'validateAcceptanceReport',
]) {
  assert(exportName in acceptance, `Product acceptance module must export ${exportName}.`);
}

console.log('Evidence boundary tests passed (generic runtime evidence isolated from source-only ChatGPT product acceptance).');
