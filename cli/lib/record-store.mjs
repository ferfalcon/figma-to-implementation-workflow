import {
  existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { renderGeneratedState } from './generated-state.mjs';
import { inspectWorkflowRecord, validateWorkflowRecord } from '../../scripts/lib/validate-workflow-record.mjs';

function recordText(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function tempPath(path, label, sequence) {
  return `${path}.${label}-${process.pid}-${Date.now()}-${sequence}.tmp`;
}

function asBuffer(content) {
  return Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8');
}

function normalizeFileChanges(fileChanges) {
  const normalized = new Map();
  for (const [path, change] of fileChanges ?? []) {
    const value = typeof change === 'string' || Buffer.isBuffer(change)
      ? { content: change, overwrite: false }
      : change;
    normalized.set(resolve(path), {
      content: asBuffer(value.content),
      overwrite: Boolean(value.overwrite),
    });
  }
  return normalized;
}

function isStrictRepair(before, after) {
  if (after.length >= before.length) return false;
  const beforeSet = new Set(before);
  return after.every((finding) => beforeSet.has(finding));
}

function verifyArtifactFiles(recordPath, record, fileSet) {
  if (record.schemaVersion !== 2) return [];
  const projectRoot = resolve(dirname(recordPath), '..');
  const findings = [];
  for (const artifact of record.artifacts) {
    if (artifact.status === 'Superseded') continue;
    const path = isAbsolute(artifact.path) ? artifact.path : resolve(projectRoot, artifact.path);
    if (!fileSet.has(path) && !existsSync(path)) {
      findings.push(`$.artifacts: active artifact ${artifact.id} is missing its narrative file ${artifact.path}`);
    }
  }
  return findings;
}

function rollback(committed, originals) {
  const rollbackTemps = [];
  try {
    for (let index = 0; index < committed.length; index += 1) {
      const path = committed[index];
      const original = originals.get(path);
      if (original === null) {
        rmSync(path, { force: true });
        continue;
      }
      const temp = tempPath(path, 'rollback', index);
      writeFileSync(temp, original, { flag: 'wx' });
      rollbackTemps.push(temp);
      renameSync(temp, path);
    }
  } finally {
    rollbackTemps.forEach((path) => rmSync(path, { force: true }));
  }
}

function writeFileSet(files) {
  const staged = [];
  const committed = [];
  const originals = new Map();
  try {
    let sequence = 0;
    for (const [path, change] of files) {
      mkdirSync(dirname(path), { recursive: true });
      const original = existsSync(path) ? readFileSync(path) : null;
      originals.set(path, original);
      const temp = tempPath(path, 'candidate', sequence);
      sequence += 1;
      writeFileSync(temp, change.content, { flag: 'wx' });
      staged.push([temp, path]);
    }
    for (const [temp, path] of staged) {
      renameSync(temp, path);
      committed.push(path);
    }
  } catch (error) {
    staged.forEach(([temp]) => rmSync(temp, { force: true }));
    try {
      rollback([...committed].reverse(), originals);
    } catch (rollbackError) {
      throw new Error(`Transaction failed and rollback also failed: ${error.message}; rollback: ${rollbackError.message}`);
    }
    throw error;
  } finally {
    staged.forEach(([temp]) => rmSync(temp, { force: true }));
  }
}

export function readStoredRecord(recordPath) {
  if (!existsSync(recordPath)) {
    throw new Error(`Workflow record not found at ${recordPath}. Run "design-workflow init" first.`);
  }
  const bytes = readFileSync(recordPath, 'utf8');
  try {
    return { record: JSON.parse(bytes), bytes };
  } catch (error) {
    throw new Error(`Workflow record is not valid JSON: ${error.message}`);
  }
}

export function requireMutableRecord(record) {
  if (record.schemaVersion === 1) {
    throw new Error('Schema-v1 records are read-only. Run "design-workflow migrate" before mutation.');
  }
  if (record.schemaVersion !== 2) {
    throw new Error(`Unsupported workflow record schema version: ${String(record.schemaVersion)}`);
  }
}

export function prepareRecordMutation(recordPath, options = {}) {
  const stored = readStoredRecord(recordPath);
  if (!options.allowLegacy) requireMutableRecord(stored.record);
  return {
    ...stored,
    findings: validateWorkflowRecord(stored.record),
    candidate: structuredClone(stored.record),
  };
}

export function commitRecordCandidate({
  recordPath,
  currentRecord = null,
  candidate,
  fileChanges = new Map(),
  requireClean = true,
  repair = false,
  allowCreate = false,
}) {
  const recordAbsolute = resolve(recordPath);
  const current = currentRecord ?? (existsSync(recordAbsolute) ? readStoredRecord(recordAbsolute).record : null);
  if (!current && !allowCreate) throw new Error(`Workflow record not found at ${recordAbsolute}.`);
  if (current && current.schemaVersion === 1 && candidate.schemaVersion === 1) requireMutableRecord(current);

  const beforeFindings = current ? validateWorkflowRecord(current) : [];
  if (requireClean && beforeFindings.length > 0 && !repair) {
    throw new Error(`Current workflow record is invalid:\n${beforeFindings.map((item) => `- ${item}`).join('\n')}`);
  }

  const narrativeChanges = normalizeFileChanges(fileChanges);
  for (const [path, change] of narrativeChanges) {
    if (existsSync(path) && !change.overwrite) {
      throw new Error(`Refusing to overwrite existing stage destination ${path}. Use "artifact adopt" instead.`);
    }
  }

  const candidateFindings = [
    ...validateWorkflowRecord(candidate),
    ...verifyArtifactFiles(recordAbsolute, candidate, narrativeChanges),
  ];
  if (candidateFindings.length > 0) {
    if (!(repair && isStrictRepair(beforeFindings, candidateFindings))) {
      throw new Error(`Candidate workflow record is invalid:\n${candidateFindings.map((item) => `- ${item}`).join('\n')}`);
    }
  }

  const rendered = renderGeneratedState(recordAbsolute, candidate);
  const completeSet = new Map();
  completeSet.set(recordAbsolute, { content: asBuffer(recordText(candidate)), overwrite: true });
  for (const [path, content] of rendered) {
    completeSet.set(resolve(path), { content: asBuffer(content), overwrite: true });
  }
  for (const [path, change] of narrativeChanges) completeSet.set(path, change);
  writeFileSet(completeSet);
  return {
    record: candidate,
    files: [...completeSet.keys()],
    findings: candidateFindings,
  };
}

export function mutateRecord(recordPath, mutator, options = {}) {
  const prepared = prepareRecordMutation(recordPath, options);
  const result = mutator(prepared.candidate, prepared.record) ?? {};
  return commitRecordCandidate({
    recordPath,
    currentRecord: prepared.record,
    candidate: prepared.candidate,
    fileChanges: result.fileChanges,
    requireClean: options.requireClean ?? true,
    repair: Boolean(options.repair),
  });
}

export function recordInspection(record) {
  return inspectWorkflowRecord(record);
}
