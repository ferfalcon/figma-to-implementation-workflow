#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const self = 'scripts/test-installation-artifact.mjs';
const canonical = 'Project-settings--Instructions.md';
const deprecated = ['AI-project-settings.md', 'ChatGPT-Project-Instructions.md'];
const allowedAliasReferences = new Set([self, 'scripts/validate-workflow.mjs', 'CHANGELOG.md']);
const read = (path) => readFileSync(join(root, path), 'utf8');

assert(existsSync(join(root, canonical)), 'Canonical Project Instructions artifact must exist.');
for (const path of deprecated) {
  assert(!existsSync(join(root, path)), `Deprecated installation artifact must not exist at repository root: ${path}`);
}

const instructions = read(canonical);
assert(instructions.startsWith('# Project locator'), 'Canonical Project Instructions must start with the repository locator.');
assert(instructions.includes('- Repository: `<REPOSITORY_URL>`'), 'Canonical Project Instructions must expose the repository bootstrap locator.');
assert(instructions.includes('design-workflow.config.json'), 'Canonical Project Instructions must delegate durable project context to repository configuration.');
assert(instructions.length <= 8000, `Canonical Project Instructions exceed the 8000-character host limit (${instructions.length} characters).`);
assert.deepEqual(
  [...new Set(instructions.match(/<[^>\n]+>/g) ?? [])],
  ['<REPOSITORY_URL>'],
  'Repository URL must be the only setup placeholder in the canonical Project Instructions.',
);

const semantic = JSON.parse(read('workflow/semantic-contract.json'));
const settingsEntrypoint = semantic.entrypoints.find((entry) => entry.id === 'chatgpt-project-settings');
assert.equal(settingsEntrypoint?.path, canonical, 'Semantic entrypoint must point to the canonical Project Instructions artifact.');
assert(settingsEntrypoint?.owns.includes('canonical Project Instructions installation artifact'), 'Semantic entrypoint must own installation-artifact authority.');
assert.deepEqual(
  semantic.productModel?.bootstrap?.requiredInitialInputs,
  [{ id: 'repository-url', host: canonical, placeholder: '<REPOSITORY_URL>' }],
  'Product bootstrap must require only the repository URL hosted by the canonical Project Instructions artifact.',
);

for (const path of ['README.md', 'QUICKSTART.md']) {
  assert(read(path).includes(`](${canonical})`), `${path} must link the canonical Project Instructions artifact.`);
}

const pkg = JSON.parse(read('package.json'));
assert(pkg.files.includes(canonical), 'Published package must include the canonical Project Instructions artifact.');
for (const path of deprecated) assert(!pkg.files.includes(path), `Published package must not include deprecated installation artifact ${path}.`);

const activeDistributionSources = [
  'scripts/build-consumer-bundle.mjs',
  '.github/workflows/release-consumer-bundle.yml',
  'starters/astro/README.md',
];
for (const path of activeDistributionSources) {
  assert(read(path).includes(canonical), `${path} must use the canonical Project Instructions filename.`);
}

function walk(directory) {
  const paths = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist'].includes(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...walk(absolute));
    else if (entry.isFile()) paths.push(absolute);
  }
  return paths;
}

const textExtensions = new Set(['.md', '.mjs', '.json', '.yml', '.yaml']);
const aliasFindings = [];
for (const absolute of walk(root)) {
  const path = relative(root, absolute).split('\\').join('/');
  if (allowedAliasReferences.has(path) || !textExtensions.has(extname(path))) continue;
  const content = readFileSync(absolute, 'utf8');
  for (const alias of deprecated) {
    if (content.includes(alias)) aliasFindings.push(`${path} references deprecated installation alias ${alias}`);
  }
}
assert.deepEqual(aliasFindings, [], `Deprecated installation aliases remain in active contracts:\n${aliasFindings.join('\n')}`);

console.log('Installation artifact contract passed (one canonical Project Instructions filename, one repository locator, and no active legacy aliases).');
