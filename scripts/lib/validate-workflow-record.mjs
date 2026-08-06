const PROFILE_ARTIFACTS = {
  Express: new Set([
    'WORKPACK',
  ]),
  Lite: new Set([
    'SOURCE-BASELINE',
    'PROJECT-CONTEXT',
    'WORKFLOW-STATE',
    'DESIGN-AUDIT',
    'IMPLEMENTATION-BRIEF',
    'IMPLEMENTATION-REVIEW',
  ]),
  Standard: new Set([
    'SOURCE-BASELINE',
    'PROJECT-CONTEXT',
    'WORKFLOW-STATE',
    'DESIGN-AUDIT',
    'REQUIREMENTS',
    'DESIGN',
    'SPEC',
    'DOCUMENT-REVIEW',
    'PLAN',
    'PLAN-REVIEW',
    'TASKS-INDEX',
    'IMPLEMENTATION-REVIEW',
  ]),
  Full: new Set([
    'SOURCE-BASELINE',
    'PROJECT-CONTEXT',
    'WORKFLOW-STATE',
    'DESIGN-AUDIT',
    'REQUIREMENTS',
    'DESIGN',
    'SPEC',
    'DOCUMENT-REVIEW',
    'ARCHITECTURE',
    'PLAN',
    'PLAN-REVIEW',
    'TASKS-INDEX',
    'IMPLEMENTATION-REVIEW',
  ]),
};

const EXPRESS_FORBIDDEN_ARTIFACTS = new Set([
  'SOURCE-BASELINE',
  'PROJECT-CONTEXT',
  'WORKFLOW-STATE',
  'DESIGN-AUDIT',
  'IMPLEMENTATION-BRIEF',
  'REQUIREMENTS',
  'DESIGN',
  'SPEC',
  'DOCUMENT-REVIEW',
  'ARCHITECTURE',
  'PLAN',
  'PLAN-REVIEW',
  'TASKS-INDEX',
  'TASK',
  'IMPLEMENTATION-REVIEW',
]);

const ARTIFACT_TYPES = [
  'WORKPACK',
  'SOURCE-BASELINE',
  'PROJECT-CONTEXT',
  'WORKFLOW-STATE',
  'DESIGN-AUDIT',
  'IMPLEMENTATION-BRIEF',
  'REQUIREMENTS',
  'DESIGN',
  'SPEC',
  'DOCUMENT-REVIEW',
  'ARCHITECTURE',
  'PLAN',
  'PLAN-REVIEW',
  'TASKS-INDEX',
  'TASK',
  'IMPLEMENTATION-REVIEW',
];

const ID_PATTERNS = {
  snapshot: /^SRC-(DS|REPO|RUN|DOC|ASSET)-\d{3,}$/,
  repositorySnapshot: /^SRC-REPO-\d{3,}$/,
  task: /^P\d{2}-T\d{2}$/,
  artifact: /^ART-[A-Z0-9-]+$/,
  domain: /^(REQ|DES|DES-RWD|DES-INT|SPEC|AC|ADR|PLAN|EVD|AUD|IMPL)-[A-Z0-9-]+$/,
  commit: /^[0-9a-f]{40}$/,
};

const ENUMS = {
  profile: ['Express', 'Lite', 'Standard', 'Full'],
  mode: ['Gated', 'Continuous documentation', 'Task-by-task'],
  workflowStatus: ['Not started', 'In progress', 'Ready', 'Blocked', 'Complete'],
  artifactStatus: ['Draft', 'Reviewed', 'Approved', 'Superseded'],
  taskStatus: ['Not started', 'Ready', 'In progress', 'Blocked', 'Complete'],
  snapshotRole: ['Input baseline', 'Supporting source', 'Task start', 'Implementation output', 'Validation runtime', 'Historical reference'],
  pinStrength: ['Immutable', 'Versioned', 'Time-bound', 'Unverified'],
  snapshotStatus: ['Active', 'Superseded', 'Invalid', 'Unverified'],
  validationStatus: ['Passed', 'Failed', 'Blocked', 'Not executed', 'Not applicable'],
};

function push(errors, path, message) {
  errors.push(`${path}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function expectObject(errors, path, value) {
  if (!isObject(value)) {
    push(errors, path, 'expected an object');
    return false;
  }
  return true;
}

function expectArray(errors, path, value) {
  if (!Array.isArray(value)) {
    push(errors, path, 'expected an array');
    return false;
  }
  return true;
}

function expectEnum(errors, path, value, values) {
  if (!values.includes(value)) {
    push(errors, path, `expected one of: ${values.join(', ')}`);
    return false;
  }
  return true;
}

function expectPattern(errors, path, value, pattern) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    push(errors, path, `invalid identifier or value: ${String(value)}`);
    return false;
  }
  return true;
}

function findCycles(tasksById) {
  const cycles = [];
  const visiting = new Set();
  const visited = new Set();
  const path = [];

  function visit(taskId) {
    if (visiting.has(taskId)) {
      const start = path.indexOf(taskId);
      cycles.push([...path.slice(start), taskId]);
      return;
    }
    if (visited.has(taskId)) return;

    visiting.add(taskId);
    path.push(taskId);
    const task = tasksById.get(taskId);
    for (const dependency of task?.prerequisites ?? []) visit(dependency);
    path.pop();
    visiting.delete(taskId);
    visited.add(taskId);
  }

  for (const taskId of tasksById.keys()) visit(taskId);
  return cycles;
}

export function validateWorkflowRecord(record) {
  const errors = [];

  if (!expectObject(errors, '$', record)) return errors;

  if (record.schemaVersion !== 1) push(errors, '$.schemaVersion', 'expected schema version 1');

  if (expectObject(errors, '$.project', record.project)) {
    if (typeof record.project.name !== 'string' || record.project.name.trim() === '') {
      push(errors, '$.project.name', 'must be a non-empty string');
    }
    expectEnum(errors, '$.project.profile', record.project.profile, ENUMS.profile);
    expectEnum(errors, '$.project.executionMode', record.project.executionMode, ENUMS.mode);
  }

  if (expectObject(errors, '$.state', record.state)) {
    if (!Number.isInteger(record.state.stage) || record.state.stage < 0 || record.state.stage > 11) {
      push(errors, '$.state.stage', 'must be an integer from 0 through 11');
    }
    expectEnum(errors, '$.state.status', record.state.status, ENUMS.workflowStatus);
    if (expectArray(errors, '$.state.activeInputs', record.state.activeInputs)) {
      record.state.activeInputs.forEach((id, index) => expectPattern(errors, `$.state.activeInputs[${index}]`, id, ID_PATTERNS.snapshot));
    }
    if (record.state.currentTask !== null && record.state.currentTask !== undefined) {
      expectPattern(errors, '$.state.currentTask', record.state.currentTask, ID_PATTERNS.task);
    }
    if (record.state.latestOutput !== null && record.state.latestOutput !== undefined) {
      expectPattern(errors, '$.state.latestOutput', record.state.latestOutput, ID_PATTERNS.repositorySnapshot);
    }
  }

  const snapshots = expectArray(errors, '$.snapshots', record.snapshots) ? record.snapshots : [];
  const artifacts = expectArray(errors, '$.artifacts', record.artifacts) ? record.artifacts : [];
  const tasks = expectArray(errors, '$.tasks', record.tasks) ? record.tasks : [];

  const allIds = new Map();
  const snapshotsById = new Map();
  const tasksById = new Map();

  function registerId(id, path) {
    if (allIds.has(id)) push(errors, path, `duplicate ID; first declared at ${allIds.get(id)}`);
    else allIds.set(id, path);
  }

  snapshots.forEach((snapshot, index) => {
    const path = `$.snapshots[${index}]`;
    if (!expectObject(errors, path, snapshot)) return;
    if (expectPattern(errors, `${path}.id`, snapshot.id, ID_PATTERNS.snapshot)) {
      registerId(snapshot.id, `${path}.id`);
      snapshotsById.set(snapshot.id, snapshot);
    }
    expectEnum(errors, `${path}.role`, snapshot.role, ENUMS.snapshotRole);
    expectEnum(errors, `${path}.pinStrength`, snapshot.pinStrength, ENUMS.pinStrength);
    expectEnum(errors, `${path}.status`, snapshot.status, ENUMS.snapshotStatus);
    if (typeof snapshot.reference !== 'string' || snapshot.reference.trim() === '') push(errors, `${path}.reference`, 'must be a non-empty string');
    if (snapshot.commit !== undefined) expectPattern(errors, `${path}.commit`, snapshot.commit, ID_PATTERNS.commit);
    if (snapshot.parent !== undefined) expectPattern(errors, `${path}.parent`, snapshot.parent, ID_PATTERNS.repositorySnapshot);
    if (snapshot.task !== undefined) expectPattern(errors, `${path}.task`, snapshot.task, ID_PATTERNS.task);

    if (snapshot.role === 'Implementation output') {
      if (!snapshot.id?.startsWith('SRC-REPO-')) push(errors, `${path}.id`, 'Implementation output must be a repository snapshot');
      if (!snapshot.commit) push(errors, `${path}.commit`, 'Implementation output requires a commit SHA');
      if (!snapshot.parent) push(errors, `${path}.parent`, 'Implementation output requires a parent repository snapshot');
      if (!snapshot.task) push(errors, `${path}.task`, 'Implementation output requires a producing task');
    }
    if (snapshot.role === 'Task start' && !snapshot.id?.startsWith('SRC-REPO-')) {
      push(errors, `${path}.id`, 'Task start must be a repository snapshot');
    }
    if (snapshot.pinStrength === 'Immutable' && snapshot.id?.startsWith('SRC-REPO-') && !snapshot.commit) {
      push(errors, `${path}.commit`, 'Immutable repository snapshot requires a commit SHA');
    }
  });

  artifacts.forEach((artifact, index) => {
    const path = `$.artifacts[${index}]`;
    if (!expectObject(errors, path, artifact)) return;
    if (expectPattern(errors, `${path}.id`, artifact.id, ID_PATTERNS.artifact)) {
      registerId(artifact.id, `${path}.id`);
    }
    expectEnum(errors, `${path}.type`, artifact.type, ARTIFACT_TYPES);
    expectEnum(errors, `${path}.status`, artifact.status, ENUMS.artifactStatus);
    if (expectArray(errors, `${path}.baseline`, artifact.baseline)) {
      artifact.baseline.forEach((id, itemIndex) => expectPattern(errors, `${path}.baseline[${itemIndex}]`, id, ID_PATTERNS.snapshot));
    }
    if (artifact.references !== undefined && expectArray(errors, `${path}.references`, artifact.references)) {
      artifact.references.forEach((id, itemIndex) => {
        expectPattern(errors, `${path}.references[${itemIndex}]`, id, ID_PATTERNS.domain);
      });
    }
  });

  tasks.forEach((task, index) => {
    const path = `$.tasks[${index}]`;
    if (!expectObject(errors, path, task)) return;
    if (expectPattern(errors, `${path}.id`, task.id, ID_PATTERNS.task)) {
      registerId(task.id, `${path}.id`);
      tasksById.set(task.id, task);
    }
    expectEnum(errors, `${path}.status`, task.status, ENUMS.taskStatus);
    expectPattern(errors, `${path}.baseline`, task.baseline, ID_PATTERNS.repositorySnapshot);
    if (expectArray(errors, `${path}.prerequisites`, task.prerequisites)) {
      task.prerequisites.forEach((id, itemIndex) => expectPattern(errors, `${path}.prerequisites[${itemIndex}]`, id, ID_PATTERNS.task));
    }
    if (expectArray(errors, `${path}.references`, task.references)) {
      task.references.forEach((id, itemIndex) => {
        expectPattern(errors, `${path}.references[${itemIndex}]`, id, ID_PATTERNS.domain);
      });
    }
    if (task.output !== null && task.output !== undefined) expectPattern(errors, `${path}.output`, task.output, ID_PATTERNS.repositorySnapshot);
    if (expectArray(errors, `${path}.validation`, task.validation)) {
      task.validation.forEach((check, checkIndex) => {
        const checkPath = `${path}.validation[${checkIndex}]`;
        if (!expectObject(errors, checkPath, check)) return;
        if (typeof check.name !== 'string' || check.name.trim() === '') push(errors, `${checkPath}.name`, 'must be a non-empty string');
        expectEnum(errors, `${checkPath}.status`, check.status, ENUMS.validationStatus);
        if (check.status === 'Passed' && (typeof check.evidence !== 'string' || check.evidence.trim() === '')) {
          push(errors, `${checkPath}.evidence`, 'Passed validation requires evidence');
        }
        if (['Failed', 'Blocked', 'Not executed', 'Not applicable'].includes(check.status) && (typeof check.reason !== 'string' || check.reason.trim() === '')) {
          push(errors, `${checkPath}.reason`, `${check.status} validation requires a reason`);
        }
      });
    }
  });

  for (const id of record.state?.activeInputs ?? []) {
    if (!snapshotsById.has(id)) push(errors, '$.state.activeInputs', `references missing snapshot ${id}`);
  }
  if (record.state?.currentTask && !tasksById.has(record.state.currentTask)) {
    push(errors, '$.state.currentTask', `references missing task ${record.state.currentTask}`);
  }
  if (record.state?.latestOutput) {
    const output = snapshotsById.get(record.state.latestOutput);
    if (!output) push(errors, '$.state.latestOutput', `references missing snapshot ${record.state.latestOutput}`);
    else if (output.role !== 'Implementation output') push(errors, '$.state.latestOutput', 'must reference an Implementation output snapshot');
  }

  artifacts.forEach((artifact, index) => {
    for (const snapshotId of artifact.baseline ?? []) {
      if (!snapshotsById.has(snapshotId)) push(errors, `$.artifacts[${index}].baseline`, `references missing snapshot ${snapshotId}`);
    }
  });

  tasks.forEach((task, index) => {
    if (!snapshotsById.has(task.baseline)) push(errors, `$.tasks[${index}].baseline`, `references missing snapshot ${task.baseline}`);
    else if (!task.baseline.startsWith('SRC-REPO-')) push(errors, `$.tasks[${index}].baseline`, 'must reference a repository snapshot');

    for (const prerequisite of task.prerequisites ?? []) {
      if (!tasksById.has(prerequisite)) push(errors, `$.tasks[${index}].prerequisites`, `references missing task ${prerequisite}`);
      if (prerequisite === task.id) push(errors, `$.tasks[${index}].prerequisites`, 'task cannot depend on itself');
    }

    if (task.output) {
      const output = snapshotsById.get(task.output);
      if (!output) push(errors, `$.tasks[${index}].output`, `references missing snapshot ${task.output}`);
      else {
        if (output.role !== 'Implementation output') push(errors, `$.tasks[${index}].output`, 'must reference an Implementation output snapshot');
        if (output.task !== task.id) push(errors, `$.tasks[${index}].output`, `snapshot ${task.output} is not attributed to ${task.id}`);
        if (output.parent !== task.baseline) push(errors, `$.tasks[${index}].output`, `snapshot ${task.output} parent must equal task baseline ${task.baseline}`);
      }
    }

    if (task.status === 'Complete') {
      if (!task.output) push(errors, `$.tasks[${index}].output`, 'Complete task requires an output snapshot');
      const unresolved = (task.validation ?? []).filter((check) => check.status !== 'Passed' && check.status !== 'Not applicable');
      if (unresolved.length > 0) push(errors, `$.tasks[${index}].validation`, 'Complete task cannot contain failed, blocked, or unexecuted required validation');
    }
  });

  snapshots.forEach((snapshot, index) => {
    if (snapshot.parent && !snapshotsById.has(snapshot.parent)) push(errors, `$.snapshots[${index}].parent`, `references missing snapshot ${snapshot.parent}`);
    if (snapshot.task && !tasksById.has(snapshot.task)) push(errors, `$.snapshots[${index}].task`, `references missing task ${snapshot.task}`);
  });

  for (const cycle of findCycles(tasksById)) {
    push(errors, '$.tasks', `dependency cycle detected: ${cycle.join(' -> ')}`);
  }

  const profile = record.project?.profile;
  const presentTypes = new Set(artifacts.filter((artifact) => artifact.status !== 'Superseded').map((artifact) => artifact.type));

  if (PROFILE_ARTIFACTS[profile]) {
    for (const requiredType of PROFILE_ARTIFACTS[profile]) {
      if (!presentTypes.has(requiredType)) push(errors, '$.artifacts', `${profile} profile requires ${requiredType}`);
    }
  }

  if (profile === 'Express') {
    for (const artifactType of presentTypes) {
      if (EXPRESS_FORBIDDEN_ARTIFACTS.has(artifactType)) {
        push(errors, '$.artifacts', `Express profile must consolidate ${artifactType} responsibility in WORKPACK`);
      }
    }
    if (tasks.length > 1) push(errors, '$.tasks', 'Express profile permits at most one implementation task');
    tasks.forEach((task, index) => {
      if ((task.prerequisites ?? []).length > 0) {
        push(errors, `$.tasks[${index}].prerequisites`, 'Express task cannot have task prerequisites');
      }
    });
    if (Number.isInteger(record.state?.stage) && record.state.stage >= 9 && tasks.length !== 1) {
      push(errors, '$.tasks', 'Express profile requires exactly one task from Stage 9 onward');
    }
  }

  if (profile === 'Lite' && ['REQUIREMENTS', 'DESIGN', 'SPEC', 'PLAN'].some((type) => presentTypes.has(type))) {
    push(errors, '$.artifacts', 'Lite profile should consolidate requirements, design, specification, and planning in IMPLEMENTATION-BRIEF');
  }

  if (record.project?.executionMode === 'Task-by-task' && Number.isInteger(record.state?.stage) && record.state.stage < 9) {
    push(errors, '$.state.stage', 'Task-by-task mode requires task decomposition to be reached');
  }

  if (record.state?.status === 'Complete') {
    if (record.state.stage !== 11) push(errors, '$.state.stage', 'Complete workflow must be at Stage 11');
    if (tasks.some((task) => task.status !== 'Complete')) push(errors, '$.tasks', 'Complete workflow cannot contain incomplete tasks');
    if (profile === 'Express' && tasks.length !== 1) push(errors, '$.tasks', 'Complete Express workflow requires exactly one completed task');
  }

  return errors;
}
