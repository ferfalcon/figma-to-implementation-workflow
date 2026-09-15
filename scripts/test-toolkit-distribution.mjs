#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectToolkitRelease } from './check-toolkit-release.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = join(root, '.github', 'workflows', 'release-toolkit.yml');
const contractPath = join(root, 'workflow', 'Toolkit-Distribution.md');

assert(existsSync(workflowPath), 'Stable toolkit release workflow must exist.');
assert(existsSync(contractPath), 'Toolkit distribution contract must exist.');

const workflow = readFileSync(workflowPath, 'utf8');
const contract = readFileSync(contractPath, 'utf8');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

const triggerBlock = workflow.slice(workflow.indexOf('on:'), workflow.indexOf('\nconcurrency:'));
assert.match(triggerBlock, /workflow_dispatch:/, 'Stable releases must be explicitly dispatched.');
for (const automaticTrigger of ['push:', 'pull_request:', 'release:']) {
  assert(!triggerBlock.includes(automaticTrigger), `Stable release workflow must not use automatic trigger ${automaticTrigger}`);
}
assert.match(triggerBlock, /version:[\s\S]*?required:\s*true/, 'Release dispatch must require an explicit version.');

assert.match(workflow, /\$GITHUB_REF" != "refs\/heads\/main"/, 'Release workflow must fail closed outside main.');
assert.match(workflow, /scripts\/check-toolkit-release\.mjs/, 'Release workflow must run release-metadata preflight.');
assert.match(workflow, /node-version:\s*\n\s*- 22\s*\n\s*- 24/, 'Release validation must cover Node.js 22 and 24.');
assert.match(workflow, /npm run validate/, 'Release workflow must run the full repository validation contract.');
assert.match(workflow, /npm pack --dry-run/, 'Release workflow must verify package generation.');
assert.match(workflow, /git diff --exit-code/, 'Release workflow must reject packaging drift.');
assert.match(workflow, /release:[\s\S]*?permissions:\s*\n\s*contents:\s*write/, 'Only the release job should need contents write permission.');
assert.match(workflow, /gh release create "\$TAG"/, 'Stable publication must create a GitHub Release.');
assert.match(workflow, /--target "\$GITHUB_SHA"/, 'Release tag must target the exact validated workflow commit.');
assert.match(workflow, /Tag \$\{TAG\} already exists/, 'Existing version tags must fail closed.');
assert.match(workflow, /TAG_SHA[\s\S]*?"\$TAG_SHA" != "\$GITHUB_SHA"/, 'Created tag must be verified against the validated commit.');

const externalUses = [...workflow.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+).*$/gm)].map(match => match[1]);
assert(externalUses.length > 0, 'Release workflow must contain pinned checkout/setup actions.');
for (const value of externalUses) {
  if (value.startsWith('./') || value.startsWith('docker://')) continue;
  const separator = value.lastIndexOf('@');
  const ref = separator > 0 ? value.slice(separator + 1) : '';
  assert.match(ref, /^[0-9a-f]{40}$/i, `Release workflow external action must use a full commit SHA: ${value}`);
}

for (const retiredCoupling of [
  'build:consumer-bundle',
  'build:astro-scaffold',
  'release/acceptance.json',
  'STARTER_PUBLISH_TOKEN',
  'STARTER_TEMPLATE_REPOSITORY',
  'gh release upload',
  'actions/upload-artifact',
]) {
  assert(!workflow.includes(retiredCoupling), `Stable toolkit publication must not restore retired application-release coupling: ${retiredCoupling}`);
}

for (const heading of ['## Channels', '## Stable release invariants', '## Canonical release workflow', '## Product acceptance is separate', '## Bootstrap boundary']) {
  assert(contract.includes(heading), `Toolkit distribution contract is missing ${heading}.`);
}
assert.match(contract, /`main` is the \*\*development channel\*\*/, 'Distribution contract must distinguish main from stable releases.');
assert.match(contract, /GitHub Release[\s\S]*?\*\*stable channel\*\*/, 'Distribution contract must define GitHub Releases as the stable channel.');
assert.match(contract, /exact commit SHA/, 'Distribution contract must require exact-SHA runtime identity.');
assert.match(contract, /does not by itself change `Project-settings--Instructions\.md`/, 'Distribution contract must keep bootstrap migration separate.');
assert(readme.includes('workflow/Toolkit-Distribution.md'), 'README reference map must expose the toolkit distribution contract.');

const readyChangelog = `# Changelog\n\n## [Unreleased]\n\n## [1.2.3] — 2026-09-15\n\n### Added\n\n- Stable release fixture.\n`;
const ready = inspectToolkitRelease({
  requestedVersion: '1.2.3',
  packageMetadata: { version: '1.2.3' },
  changelog: readyChangelog,
});
assert.equal(ready.ready, true);
assert.equal(ready.tag, 'v1.2.3');

const pending = inspectToolkitRelease({
  requestedVersion: '1.2.3',
  packageMetadata: { version: '1.2.3' },
  changelog: readyChangelog.replace('## [Unreleased]\n', '## [Unreleased]\n\n### Added\n\n- Not released yet.\n'),
});
assert.equal(pending.ready, false);
assert(pending.findings.some(finding => finding.includes('[Unreleased]')));

const mismatch = inspectToolkitRelease({
  requestedVersion: '1.2.4',
  packageMetadata: { version: '1.2.3' },
  changelog: readyChangelog,
});
assert.equal(mismatch.ready, false);
assert(mismatch.findings.some(finding => finding.includes('does not match')));

const prerelease = inspectToolkitRelease({
  requestedVersion: '1.2.3-beta.1',
  packageMetadata: { version: '1.2.3-beta.1' },
  changelog: readyChangelog.replaceAll('1.2.3', '1.2.3-beta.1'),
});
assert.equal(prerelease.ready, false);
assert(prerelease.findings.some(finding => finding.includes('stable MAJOR.MINOR.PATCH')));

const missingHeading = inspectToolkitRelease({
  requestedVersion: '1.2.3',
  packageMetadata: { version: '1.2.3' },
  changelog: '# Changelog\n\n## [Unreleased]\n',
});
assert.equal(missingHeading.ready, false);
assert(missingHeading.findings.some(finding => finding.includes('dated release heading')));

console.log('Toolkit distribution tests passed: manual stable channel, release metadata preflight, validation matrix, immutable-by-policy tags, exact-SHA release targeting, and retired starter-publication separation.');
