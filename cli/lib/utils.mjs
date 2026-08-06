import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTIFACT_ALIASES, ARTIFACT_FILES } from './constants.mjs';
import {
  generatedStateFindings,
  syncGeneratedState,
} from './generated-state.mjs';
import { validateWorkflowRecord } from '../../scripts/lib/validate-workflow-record.mjs';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const packageRoot = resolve(moduleDirectory, '..', '..');

export function write(stream, message = '') { stream.write(`${message}\n`); }
export function fail(stderr, message) { write(stderr, `Error: ${message}`); return 1; }

export function parseArgs(args) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith('--')) { positionals.push(token); continue; }
    const equalsIndex = token.indexOf('=');
    let key;
    let value;
    if (equalsIndex >= 0) {
      key = token.slice(2, equalsIndex);
      value = token.slice(equalsIndex + 1);
    } else {
      key = token.slice(2);
      const next = args[index + 1];
      if (next !== undefined && !next.startsWith('--')) { value = next; index += 1; }
      else value = true;
    }
    if (Object.hasOwn(options, key)) {
      options[key] = Array.isArray(options[key]) ? [...options[key], value] : [options[key], value];
    } else options[key] = value;
  }
  return { positionals, options };
}

export function values(option) {
  if (option === undefined) return [];
  return Array.isArray(option) ? option : [option];
}

export function commaList(option) {
  return values(option).flatMap((item) => String(item).split(','))
    .map((item) => item.trim()).filter(Boolean);
}

export function normalizeChoice(value, choices) {
  if (typeof value !== 'string') return null;
  return choices.find((choice) => choice.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

export function resolveRecordPath(cwd, option) {
  if (typeof option === 'string') return isAbsolute(option) ? option : resolve(cwd, option);
  return join(cwd, '.workflow', 'workflow-record.json');
}

export function readRecord(path) {
  if (!existsSync(path)) throw new Error(`Workflow record not found at ${path}. Run "design-workflow init" first.`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeRecord(path, record) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

export function syncWorkflowViews(path, record, options) {
  return syncGeneratedState(path, record, options);
}

export function workflowFindings(path, record) {
  const findings = validateWorkflowRecord(record);
  try {
    findings.push(...generatedStateFindings(path, record));
  } catch (error) {
    findings.push(`Generated workflow views could not be evaluated: ${error instanceof Error ? error.message : String(error)}`);
  }
  return findings;
}

export function saveRecord(path, record) {
  writeRecord(path, record);
  syncGeneratedState(path, record);
  return validateWorkflowRecord(record);
}

export function nextId(items, prefix, field = 'id') {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`^${escaped}(\\d+)$`);
  const highest = items.reduce((max, item) => {
    const match = expression.exec(item?.[field] ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(3, '0')}`;
}

export function nextTaskId(tasks) {
  const highest = tasks.reduce((max, task) => {
    const match = /^P01-T(\d{2})$/.exec(task.id ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `P01-T${String(highest + 1).padStart(2, '0')}`;
}

export function artifactType(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replaceAll('_', '-');
  return ARTIFACT_ALIASES.get(normalized)
    ?? (Object.hasOwn(ARTIFACT_FILES, value.toUpperCase()) ? value.toUpperCase() : null);
}

export function artifactId(record, type, suffix = '') {
  const base = `ART-${type}${suffix ? `-${suffix}` : ''}`.replaceAll('_', '-');
  const existing = new Set(record.artifacts.map((item) => item.id));
  if (!existing.has(base)) return base;
  let number = 2;
  while (existing.has(`${base}-${number}`)) number += 1;
  return `${base}-${number}`;
}

export function createArtifactFile(cwd, type, options = {}) {
  const mapping = ARTIFACT_FILES[type];
  if (!mapping) return null;
  let [defaultName, templateName] = mapping;
  if (type === 'TASK' && options.taskId) {
    const [, taskNumber] = options.taskId.split('-T');
    defaultName = `Phase-01--Task-${taskNumber}.md`;
  }
  const destination = options.path
    ? (isAbsolute(options.path) ? options.path : resolve(cwd, options.path))
    : join(cwd, defaultName);
  const templatePath = join(packageRoot, 'templates', templateName);
  if (!existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);
  if (existsSync(destination) && !options.force) return destination;
  mkdirSync(dirname(destination), { recursive: true });
  let content = readFileSync(templatePath, 'utf8');
  if (type === 'TASK' && options.taskId) {
    const title = options.title || 'Implementation task';
    content = content.replace(/id: P01-T01/g, `id: ${options.taskId}`)
      .replace(/# Phase 01 — Task 01: Task title/g, `# Phase 01 — Task ${options.taskId.slice(-2)}: ${title}`)
      .replace(/P01-T01/g, options.taskId);
  }
  writeFileSync(destination, content, 'utf8');
  return destination;
}

export function relativeDisplay(cwd, path) {
  return path?.startsWith(cwd) ? path.slice(cwd.length + 1) : path;
}

export function activeRepositorySnapshot(record) {
  if (record.state.latestOutput) return record.state.latestOutput;
  const active = [...record.state.activeInputs].reverse().find((id) => id.startsWith('SRC-REPO-'));
  if (active) return active;
  return [...record.snapshots].reverse().find((snapshot) => snapshot.id.startsWith('SRC-REPO-'))?.id ?? null;
}

export function gitCommit(repositoryPath) {
  try {
    return execFileSync('git', ['-C', repositoryPath, 'rev-parse', 'HEAD'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch { return null; }
}

export function printFindings(stdout, errors) {
  if (errors.length === 0) { write(stdout, 'Validation: passed'); return; }
  write(stdout, `Validation: ${errors.length} finding(s)`);
  errors.forEach((error) => write(stdout, `- ${error}`));
}

export { validateWorkflowRecord };
