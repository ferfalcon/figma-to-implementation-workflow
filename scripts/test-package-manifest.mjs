#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPathWithin } from './lib/path-safety.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const provenancePath = join(root, 'cli', 'toolkit-provenance.json');
const obsoleteBootstrapPath = join(root, 'AGENTS-INIT.md');
if (existsSync(obsoleteBootstrapPath)) {
  throw new Error('AGENTS-INIT.md is an obsolete duplicate bootstrap and must not exist in the source repository.');
}

const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--silent'], {
  cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
if (result.status !== 0) {
  throw new Error(`npm pack --dry-run failed:\n${result.stderr || result.stdout}`);
}

const report = JSON.parse(result.stdout)[0];
const files = new Set(report.files.map((item) => item.path.split('\\').join('/')));
const maxRuntimeFiles = 175;
const maxUnpackedBytes = 1_250_000;
if (files.size > maxRuntimeFiles) {
  throw new Error(`Runtime package contains ${files.size} files; review the distribution boundary before exceeding ${maxRuntimeFiles}.`);
}
if (report.unpackedSize > maxUnpackedBytes) {
  throw new Error(`Runtime package unpacks to ${report.unpackedSize} bytes; review the distribution boundary before exceeding ${maxUnpackedBytes}.`);
}

const requiredAreas = [
  'AGENTS.md', 'AGENTS-instructions.md', 'AGENTS-PROMPT-Figma-file-preparation.md',
  'Project-settings--Instructions.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
  'workflow/How-It-Works.md', 'workflow/product-status.json',
  'workflow/Project-Configuration.md', 'workflow/Source-Adapters.md',
  'workflow/Implementation-Adapters.md', 'workflow/Deployment-Adapters.md',
  'workflow/Execution-Transports.md', 'workflow/ChatGPT-Experience.md', 'workflow/Product-Acceptance.md',
  'workflow/adapter-catalog.json',
  'schemas/design-workflow-config.schema.json', 'templates/design-workflow.config.template.json',
  'templates/PRODUCT-ACCEPTANCE.v2.template.json',
  'cli/', 'cli/lib/evidence.mjs', 'cli/toolkit-provenance.json', 'workflow/', 'guidelines/', 'prompts/', 'source-adapters/',
  'implementation-adapters/', 'deployment-adapters/', 'templates/', 'schemas/',
];
const missingAreas = requiredAreas.filter((area) => (
  area.endsWith('/') ? ![...files].some((path) => path.startsWith(area)) : !files.has(area)
));
if (missingAreas.length > 0) throw new Error(`Package is missing required runtime areas: ${missingAreas.join(', ')}`);
if (existsSync(provenancePath)) throw new Error('npm postpack must remove the transient source-tree toolkit provenance file.');

const forbiddenPrefixes = [
  'examples/',
  'scripts/',
  'starters/',
  'tests/',
  'implementation-adapters/astro/scaffold/',
];
const forbiddenExact = new Set(['AGENTS-INIT.md', 'cli/lib/product-evidence.mjs']);
const forbidden = [...files].filter((path) => (
  path.startsWith('node_modules/')
  || path.endsWith('.tgz')
  || forbiddenExact.has(path)
  || forbiddenPrefixes.some((prefix) => path.startsWith(prefix))
));
if (forbidden.length > 0) {
  throw new Error(`Package contains source-repository-only files:\n${forbidden.map((path) => `- ${path}`).join('\n')}`);
}

function stripCodeFences(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

function normalizeTarget(raw) {
  let target = raw.trim();
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
  const title = target.match(/\s+["']/);
  if (title?.index !== undefined) target = target.slice(0, title.index);
  try { target = decodeURIComponent(target); } catch { /* report the unresolved literal below */ }
  return target.split('#')[0].split('?')[0];
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const broken = [];
for (const file of [...files].filter((path) => extname(path).toLowerCase() === '.md')) {
  const content = stripCodeFences(readFileSync(join(root, file), 'utf8'));
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const target = normalizeTarget(match[1]);
    if (!target || /^(?:https?:|mailto:|tel:|data:)/.test(target) || target.includes('<') || target.includes('>')) continue;

    const absoluteTarget = resolve(root, dirname(file), target);
    if (!isPathWithin(root, absoluteTarget)) {
      broken.push(`${file} → ${match[1]}`);
      continue;
    }

    const resolved = normalize(relative(root, absoluteTarget)).split('\\').join('/');
    const packaged = files.has(resolved) || [...files].some((path) => path.startsWith(`${resolved}/`));
    if (!packaged) broken.push(`${file} → ${match[1]}`);
  }
}
if (broken.length > 0) throw new Error(`Packaged relative Markdown links do not resolve:\n${broken.map((item) => `- ${item}`).join('\n')}`);

console.log(`Package manifest tests passed (${files.size} runtime files, ${report.unpackedSize} unpacked bytes; development examples, scripts, tests, Astro scaffold fixture, obsolete bootstrap alias, and product-acceptance implementation excluded; generic evidence runtime retained; product architecture/status surfaces packaged; all relative Markdown links resolved).`);
