#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  migrateProjectConfiguration,
  projectConfigurationRevision,
  resolveProjectSession,
} from '../cli/lib/project-configuration.mjs';
import { runCli } from '../cli/lib/workflow-cli.mjs';

const config = {
  schemaVersion: 3,
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
  deployment: { provider: null, projectUrl: null, productionUrl: null },
  workflow: { reviewStyle: 'brief-and-final' },
};

const reordered = {
  workflow: { reviewStyle: 'brief-and-final' },
  deployment: { productionUrl: null, projectUrl: null, provider: null },
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
  schemaVersion: 3,
};

const revision = projectConfigurationRevision(config);
assert.deepEqual(revision, {
  algorithm: 'sha256',
  digest: '6c10767c98eebde4bcc1dfa9e7e05ae8e33da76424be440296eb23c3dca916ad',
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

const v2 = {
  schemaVersion: 2,
  project: structuredClone(config.project),
  repository: structuredClone(config.repository),
  design: structuredClone(config.design),
  deployment: { vercelProjectUrl: null, productionUrl: null },
  workflow: { reviewStyle: 'brief-and-preview' },
};
const legacyRevision = projectConfigurationRevision(v2);
const migrated = migrateProjectConfiguration(v2).config;
assert.notEqual(
  projectConfigurationRevision(migrated).digest,
  legacyRevision.digest,
  'A schema migration must produce a new semantic revision because the canonical configuration shape changed.',
);
assert.deepEqual(migrated, config, 'Equivalent v2 semantics must migrate to the expected v3 representation.');

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

console.log('Project configuration revision tests passed: v3 canonical JSON produces a stable SHA-256 identity, key ordering is ignored, migration changes semantic identity, and project check remains read-only.');
