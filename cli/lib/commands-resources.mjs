import { ARTIFACT_STATUSES, SNAPSHOT_KINDS } from './constants.mjs';
import {
  artifactId, artifactType, commaList, createArtifactFile, fail, nextId,
  normalizeChoice, printFindings, readRecord, relativeDisplay,
  resolveRecordPath, saveRecord, validateWorkflowRecord, write,
} from './utils.mjs';

export function commandSnapshot(cwd, stdout, stderr, positionals, options) {
  if (positionals[1] !== 'add') return fail(stderr, 'Usage: design-workflow snapshot add --kind <kind> --reference <text> [options]');
  const kind = typeof options.kind === 'string' ? SNAPSHOT_KINDS[options.kind.toLowerCase()] : null;
  if (!kind) return fail(stderr, `Unknown snapshot kind. Choose: ${Object.keys(SNAPSHOT_KINDS).join(', ')}`);
  if (typeof options.reference !== 'string' || !options.reference.trim()) return fail(stderr, '--reference is required.');
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  const id = typeof options.id === 'string' ? options.id : nextId(record.snapshots, `SRC-${kind}-`);
  const role = typeof options.role === 'string' ? options.role : 'Input baseline';
  const commit = typeof options.commit === 'string' ? options.commit.toLowerCase() : undefined;
  const snapshot = {
    id,
    role,
    pinStrength: typeof options.pin === 'string' ? options.pin : (kind === 'REPO' && commit ? 'Immutable' : 'Time-bound'),
    status: typeof options.status === 'string' ? options.status : 'Active',
    reference: options.reference.trim(),
  };
  if (commit) snapshot.commit = commit;
  if (typeof options.parent === 'string') snapshot.parent = options.parent;
  if (typeof options.task === 'string') snapshot.task = options.task;
  record.snapshots.push(snapshot);
  if (options.activate || role === 'Input baseline') {
    record.state.activeInputs = [...new Set([...record.state.activeInputs, id])];
    for (const artifact of record.artifacts) {
      if (artifact.status === 'Draft' && !artifact.baseline.includes(id)) artifact.baseline.push(id);
    }
  }
  const errors = validateWorkflowRecord(record);
  const newPath = `$.snapshots[${record.snapshots.length - 1}]`;
  const newErrors = errors.filter((error) => error.startsWith(newPath));
  if (newErrors.length > 0) {
    write(stderr, 'Snapshot was not saved because it is invalid:');
    newErrors.forEach((error) => write(stderr, `- ${error}`));
    return 1;
  }
  saveRecord(recordPath, record);
  write(stdout, `Added snapshot ${id}`);
  return 0;
}

export function commandArtifact(cwd, stdout, stderr, positionals, options) {
  if (positionals[1] !== 'create' || !positionals[2]) return fail(stderr, 'Usage: design-workflow artifact create <type> [options]');
  const type = artifactType(positionals[2]);
  if (!type) return fail(stderr, `Unknown artifact type: ${positionals[2]}`);
  const status = normalizeChoice(options.status ?? 'Draft', ARTIFACT_STATUSES);
  if (!status) return fail(stderr, `Unknown artifact status. Choose: ${ARTIFACT_STATUSES.join(', ')}`);
  const recordPath = resolveRecordPath(cwd, options.record);
  let record;
  try { record = readRecord(recordPath); } catch (error) { return fail(stderr, error.message); }
  if (record.project.profile === 'Express' && type !== 'WORKPACK') {
    return fail(stderr, 'Express consolidates workflow ownership in WORKPACK. Upgrade the profile before creating separate artifacts.');
  }
  if (record.artifacts.some((artifact) => artifact.type === type && artifact.status !== 'Superseded') && !options.duplicate) {
    return fail(stderr, `An active ${type} artifact already exists. Use --duplicate only when multiple instances are intentional.`);
  }
  const baseline = options.baseline ? commaList(options.baseline) : [...record.state.activeInputs];
  const references = commaList(options.references);
  const file = createArtifactFile(cwd, type, {
    path: typeof options.path === 'string' ? options.path : undefined,
    force: Boolean(options.force),
  });
  record.artifacts.push({
    id: typeof options.id === 'string' ? options.id : artifactId(record, type),
    type,
    status,
    baseline,
    ...(references.length ? { references } : {}),
  });
  const errors = saveRecord(recordPath, record);
  write(stdout, `Created ${type}${file ? ` at ${relativeDisplay(cwd, file)}` : ''}`);
  printFindings(stdout, errors);
  return errors.length === 0 ? 0 : 1;
}
