export const PRODUCT_STATUS_SCHEMA_VERSION = 1;
export const REQUIRED_ACCEPTED_SCENARIOS = Object.freeze([
  'no-deployment',
  'deployment-required',
  'new-chat-resume',
  'correction',
]);

const allowedStatuses = new Set(['pending', 'accepted']);
const expectedKeys = Object.freeze([
  'schemaVersion',
  'status',
  'lastAcceptedRevision',
  'acceptedAt',
  'acceptanceReportSchemaVersion',
  'scenarios',
]);

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value) {
  return object(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expectedKeys].sort());
}

function exactSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function isoTimestamp(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

function validScenario(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function validateProductStatus(status) {
  const findings = [];
  if (!object(status)) return { valid: false, findings: ['Product status must be an object.'] };

  if (!exactKeys(status)) {
    findings.push(`Product status must contain exactly these fields: ${expectedKeys.join(', ')}.`);
  }
  if (status.schemaVersion !== PRODUCT_STATUS_SCHEMA_VERSION) {
    findings.push(`schemaVersion must be ${PRODUCT_STATUS_SCHEMA_VERSION}.`);
  }
  if (!allowedStatuses.has(status.status)) {
    findings.push('status must be pending or accepted.');
  }
  if (!Array.isArray(status.scenarios)) {
    findings.push('scenarios must be an array.');
  } else {
    if (new Set(status.scenarios).size !== status.scenarios.length) {
      findings.push('scenarios must not contain duplicates.');
    }
    for (const scenario of status.scenarios) {
      if (!validScenario(scenario)) findings.push(`Invalid scenario id: ${String(scenario)}.`);
    }
  }

  if (status.status === 'pending') {
    if (status.lastAcceptedRevision !== null) findings.push('pending status requires lastAcceptedRevision to be null.');
    if (status.acceptedAt !== null) findings.push('pending status requires acceptedAt to be null.');
    if (status.acceptanceReportSchemaVersion !== null) {
      findings.push('pending status requires acceptanceReportSchemaVersion to be null.');
    }
    if (Array.isArray(status.scenarios) && status.scenarios.length !== 0) {
      findings.push('pending status requires scenarios to be empty.');
    }
  }

  if (status.status === 'accepted') {
    if (!exactSha(status.lastAcceptedRevision)) {
      findings.push('accepted status requires lastAcceptedRevision to be an exact lowercase 40-character commit SHA.');
    }
    if (!isoTimestamp(status.acceptedAt)) {
      findings.push('accepted status requires acceptedAt to be a canonical ISO-8601 UTC timestamp.');
    }
    if (!Number.isInteger(status.acceptanceReportSchemaVersion) || status.acceptanceReportSchemaVersion < 1) {
      findings.push('accepted status requires acceptanceReportSchemaVersion to be a positive integer.');
    }
    if (Array.isArray(status.scenarios)) {
      for (const required of REQUIRED_ACCEPTED_SCENARIOS) {
        if (!status.scenarios.includes(required)) findings.push(`accepted status is missing required scenario: ${required}.`);
      }
    }
  }

  return { valid: findings.length === 0, findings };
}
