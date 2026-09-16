#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  projectConfigurationRevision,
  resolveProjectSession,
} from '../cli/lib/project-configuration.mjs';
import { runCli } from '../cli/lib/workflow-cli.mjs';

const config = {
  schemaVersion: 2,
  project: { name: 'Configuration fixture' },
  repository: {
    url: 'https://github.com/example/product',
    implementationRoot: '.',
    workingBranch: 'design/initial-ui',
  },
  design: {
    provider: 'figma',
    url: 'https://www.figma.com/design/file?node-id=1-2',
    scope: 'Home and About',
  },
  deployment: { vercelProjectUrl: null, productionUrl: null },
  workflow: { reviewStyle: 'brief-and-preview' },
};

const reordered = {
  workflow: { reviewStyle: 'brief-and-preview' },
  deployment: { productionUrl: null, vercelProjectUrl: null },
  design: {
    scope: 'Home and About',
    url: 'https://www.figma.com/design/file?node-id=1-2',
    provider: 'figma',
  },
  repository: {
    workingBranch: 'design/initial-ui',
    implementationRoot: '.',
    url: 'https://github.com/example/product',
  },
  project: { name: 'Configuration fixture' },
  schemaVersion: 2,
};

const revision = projectConfigurationRevision(config);
assert.deepEqual(revision, {
  algorithm: 'sha256',
  digest: '17194f660f5c68046e369f9876a9020f08779e52d7a0f92dec6f652786d97f6b',
});
assert.deepEqual(
  projectConfigurationRevision(reordered),
  revision,
  'Object key order must not change semantic configuration identity.',
);
assert.deepEqual(
  resolveProjectSession(config).configurationRevision,
  revision,
  'Resolved project sessions must expose the derived configuration revision.',
);

const changed = structuredClone(config);
changed.project.name = 'Changed configuration';
assert.notEqual(
  projectConfigurationRevision(changed).digest,
  revision.digest,
  'A semantic configuration change must produce a different revision.',
);

const invalid = structuredClone(config);
invalid.repository.implementationRoot = '../escape';
assert.throws(
  () => projectConfigurationRevision(invalid),
  /implementationRoot/,
  'Invalid configurations must not receive a trusted revision.',
);

const directory = mkdtempSync(join(tmpdir(), 'project-configuration-revision-'));
try {
  const path = join(directory, 'design-workflow.config.json');
  writeFileSync(path, `${JSON.stringify(reordered, null, 2)}\n`);
  const before = readFileSync(path, 'utf8');
  let output = '';
  const status = await runCli(['project', 'check', '--json'], {
    cwd: directory,
    stdout: { write(value) { output += value; } },
    stderr: { write() {} },
  });
  assert.equal(status, 0);
  const report = JSON.parse(output);
  assert.equal(report.valid, true);
  assert.deepEqual(report.configurationRevision, revision);
  assert.equal(report.verification, 'configuration-only');
  assert.equal(readFileSync(path, 'utf8'), before, 'Revision checks must remain read-only.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}

console.log('Project configuration revision tests passed: validated canonical JSON produces a stable SHA-256 identity, key ordering is ignored, semantic drift changes the digest, and project check exposes the read-only revision.');
