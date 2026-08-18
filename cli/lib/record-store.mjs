import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { renderGeneratedState } from './generated-state.mjs';
import { inspectWorkflowRecord, validateWorkflowRecord } from '../../scripts/lib/validate-workflow-record.mjs';

const recordVersions = new WeakMap();

function recordText(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

function digestBytes(content) {
  return createHash('sha256').update(content).digest('hex');
}

function expectedRecordDigest(record) {
  return recordVersions.get(record) ?? digestBytes(recordText(record));
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

function acquireRecordLock(recordPath) {
  const lockPath = `${recordPath}.lock`;
  mkdirSync(dirname(lockPath), { recursive: true });
  try {
    writeFileSync(lockPath, `${JSON.stringify({
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
    })}\n`, { flag: 'wx' });
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(`Workflow record is locked by another workflow mutation at ${lockPath}. If no design-workflow process is running, remove the stale lock and retry.`);
    }
    throw error;
  }
  return () => rmSync(lockPath, { force: true });
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
    const record = JSON.parse(bytes);
    recordVersions.set(record, digestBytes(bytes));
    return { record, bytes };
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
  const expectedDigest = currentRecord ? expectedRecordDigest(currentRecord) : null;
  const releaseLock = acquireRecordLock(recordAbsolute);
  try {
    const stored = existsSync(recordAbsolute) ? readStoredRecord(recordAbsolute) : null;
    if (!stored && currentRecord) {
      throw new Error('Workflow record changed since this mutation was prepared: the record was removed. Retry the command against the latest workflow state.');
    }
    if (!stored && !allowCreate) throw new Error(`Workflow record not found at ${recordAbsolute}.`);
    if (stored && allowCreate && !currentRecord) throw new Error(`Workflow record already exists at ${recordAbsolute}.`);
    if (stored && !currentRecord) {
      throw new Error('Existing workflow mutations require the current record returned by prepareRecordMutation() or readStoredRecord().');
    }
    if (stored && expectedDigest !== digestBytes(stored.bytes)) {
      throw new Error('Workflow record changed since this mutation was prepared. Retry the command against the latest workflow state.');
    }

    const current = stored?.record ?? null;
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
  } finally {
    releaseLock();
  }
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
