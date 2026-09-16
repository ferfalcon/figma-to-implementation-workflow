import {
  existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { adapterEntry } from './adapter-catalog.mjs';

const toolkitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPOSITORY_WORKFLOW_PATH = '.github/workflows/design-workflow-ui.yml';
const IGNORED_SOURCE_PARTS = new Set([
  'node_modules', 'dist', '.astro', '.vercel', 'playwright-report', 'test-results', 'validation-result.json',
]);
const PRESERVABLE_APPLICATION_FILES = new Set(['README.md', '.gitignore']);
const METADATA_FILES = new Set([
  '.editorconfig', '.git', '.gitattributes', '.gitignore',
  'AGENTS.md', 'AGENTS-instructions.md', 'AGENTS-PROMPT-Figma-file-preparation.md',
  'CHANGELOG.md', 'CONTRIBUTING.md', 'Project-settings--Instructions.md',
  'README', 'README.md', 'SECURITY.md', 'design-workflow.config.json',
]);
const METADATA_DIRECTORIES = new Set(['.git', '.github', '.workflow', 'docs']);

function posix(value) {
  return value.split('\\').join('/');
}

function pathInside(root, candidate) {
  const value = relative(root, candidate);
  return value === '' || (!value.startsWith('..') && !isAbsolute(value));
}

function normalizedImplementationRoot(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('repository.implementationRoot must be a non-empty repository-relative path.');
  const normalized = posix(value.trim()).replace(/^\.\//, '').replace(/\/$/, '') || '.';
  if (isAbsolute(normalized) || normalized.split('/').some((part) => part === '..')) {
    throw new Error('repository.implementationRoot must remain inside the project repository.');
  }
  return normalized;
}

function assertNoSymlinkAncestors(projectRoot, destination) {
  let current = destination;
  const ancestors = [];
  while (pathInside(projectRoot, current) && current !== projectRoot) {
    ancestors.push(current);
    current = dirname(current);
  }
  for (const candidate of ancestors.reverse()) {
    if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) {
      throw new Error(`Astro scaffold destination must not traverse symlinks: ${posix(relative(projectRoot, candidate))}`);
    }
  }
}

function walkFiles(root, current = root, prefix = '') {
  if (!existsSync(current)) return [];
  const files = [];
  for (const item of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const source = join(current, item.name);
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isSymbolicLink()) throw new Error(`Astro scaffold resources must not contain symlinks: ${itemPath}`);
    if (item.isDirectory()) {
      if (!IGNORED_SOURCE_PARTS.has(item.name)) files.push(...walkFiles(root, source, itemPath));
      continue;
    }
    if (!item.isFile()) throw new Error(`Astro scaffold resources must contain regular files only: ${itemPath}`);
    if (!IGNORED_SOURCE_PARTS.has(item.name)) files.push({ source, path: posix(itemPath) });
  }
  return files;
}

function mappedApplicationPath(path) {
  if (path === 'package-lock.template.json') return 'package-lock.json';
  if (path === 'gitignore.template') return '.gitignore';
  return path;
}

function metadataPath(path) {
  if (METADATA_FILES.has(path)) return true;
  if (/^(?:LICENSE|README|CONTRIBUTING|CHANGELOG|SECURITY)(?:\..+)?$/i.test(path)) return true;
  const topLevel = path.split('/')[0];
  return METADATA_DIRECTORIES.has(topLevel);
}

function yamlSingleQuoted(value) {
  return value.replaceAll("'", "''");
}

function renderRepositoryWorkflow(template, implementationRoot) {
  const prefix = implementationRoot === '.' ? '' : `${implementationRoot}/`;
  return template
    .replaceAll('__IMPLEMENTATION_PATH_PREFIX__', yamlSingleQuoted(prefix))
    .replaceAll('__IMPLEMENTATION_WORKING_DIRECTORY__', yamlSingleQuoted(implementationRoot));
}

function collectExistingFiles(root, current = root, prefix = '') {
  if (!existsSync(current)) return [];
  const files = [];
  for (const item of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = join(current, item.name);
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isSymbolicLink()) throw new Error(`Implementation root contains a symlink and is not safely scaffoldable: ${itemPath}`);
    if (item.isDirectory()) {
      if (!prefix && METADATA_DIRECTORIES.has(item.name)) continue;
      files.push(...collectExistingFiles(root, absolute, itemPath));
    } else if (item.isFile()) files.push(posix(itemPath));
    else throw new Error(`Implementation root contains an unsupported filesystem entry: ${itemPath}`);
  }
  return files;
}

export function planAstroScaffold({ projectRoot, implementationRoot }) {
  const project = resolve(projectRoot);
  const rootValue = normalizedImplementationRoot(implementationRoot);
  const applicationRoot = rootValue === '.' ? project : resolve(project, rootValue);
  if (!pathInside(project, applicationRoot)) throw new Error('Astro scaffold implementation root escapes the project repository.');
  assertNoSymlinkAncestors(project, applicationRoot);

  const adapter = adapterEntry('implementation', 'astro-typescript');
  if (!adapter?.modes?.includes('scaffold') || !adapter.scaffoldResource) {
    throw new Error('The maintained astro-typescript adapter does not expose a runtime scaffold resource.');
  }
  const scaffoldRoot = resolve(toolkitRoot, adapter.scaffoldResource);
  const applicationSource = join(scaffoldRoot, 'application');
  const workflowTemplatePath = join(scaffoldRoot, 'repository', 'validate-ui.yml.template');
  if (!existsSync(applicationSource) || !existsSync(workflowTemplatePath)) {
    throw new Error('The pinned toolkit is missing the maintained Astro runtime scaffold resources.');
  }

  const applicationFiles = walkFiles(applicationSource).map((item) => ({
    source: item.source,
    path: mappedApplicationPath(item.path),
  }));
  const plannedApplicationPaths = new Set(applicationFiles.map((item) => item.path));

  for (const existing of collectExistingFiles(applicationRoot)) {
    if (!plannedApplicationPaths.has(existing) && !metadataPath(existing)) {
      throw new Error(`Implementation root is not safely scaffoldable; inspect existing application-significant content: ${existing}`);
    }
  }

  const created = [];
  const unchanged = [];
  const preserved = [];
  const writes = [];
  const conflicts = [];

  for (const item of applicationFiles) {
    const destination = join(applicationRoot, ...item.path.split('/'));
    assertNoSymlinkAncestors(project, destination);
    const content = readFileSync(item.source);
    if (!existsSync(destination)) {
      writes.push({ destination, content });
      created.push(posix(relative(project, destination)));
      continue;
    }
    const stat = lstatSync(destination);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      conflicts.push(posix(relative(project, destination)));
      continue;
    }
    const existing = readFileSync(destination);
    if (Buffer.compare(existing, content) === 0) {
      unchanged.push(posix(relative(project, destination)));
    } else if (PRESERVABLE_APPLICATION_FILES.has(item.path)) {
      preserved.push(posix(relative(project, destination)));
    } else {
      conflicts.push(posix(relative(project, destination)));
    }
  }

  const workflowDestination = resolve(project, REPOSITORY_WORKFLOW_PATH);
  assertNoSymlinkAncestors(project, workflowDestination);
  const workflowContent = Buffer.from(renderRepositoryWorkflow(readFileSync(workflowTemplatePath, 'utf8'), rootValue));
  if (!existsSync(workflowDestination)) {
    writes.push({ destination: workflowDestination, content: workflowContent });
    created.push(REPOSITORY_WORKFLOW_PATH);
  } else {
    const stat = lstatSync(workflowDestination);
    if (!stat.isFile() || stat.isSymbolicLink() || Buffer.compare(readFileSync(workflowDestination), workflowContent) !== 0) {
      conflicts.push(REPOSITORY_WORKFLOW_PATH);
    } else {
      unchanged.push(REPOSITORY_WORKFLOW_PATH);
    }
  }

  if (conflicts.length > 0) {
    throw new Error(`Astro scaffold would overwrite existing project files:\n${conflicts.map((path) => `- ${path}`).join('\n')}`);
  }

  return {
    adapter: 'astro-typescript',
    mode: 'scaffold',
    implementationRoot: rootValue,
    workflow: REPOSITORY_WORKFLOW_PATH,
    created,
    unchanged,
    preserved,
    writes,
  };
}

export function materializeAstroScaffold(options) {
  const plan = planAstroScaffold(options);
  const written = [];
  try {
    for (const item of plan.writes) {
      mkdirSync(dirname(item.destination), { recursive: true });
      writeFileSync(item.destination, item.content, { flag: 'wx' });
      written.push(item.destination);
    }
  } catch (error) {
    for (const path of written.reverse()) rmSync(path, { force: true });
    throw error;
  }
  const { writes, ...result } = plan;
  return result;
}
