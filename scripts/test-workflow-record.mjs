#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateWorkflowRecord } from './lib/validate-workflow-record.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDirectory, '..');

function readFixture(name) {
  return JSON.parse(readFileSync(join(root, 'tests', 'fixtures', name), 'utf8'));
}

const validErrors = validateWorkflowRecord(readFixture('workflow-record.valid.json'));
if (validErrors.length > 0) {
  console.error('Expected valid fixture to pass:');
  validErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const invalidErrors = validateWorkflowRecord(readFixture('workflow-record.invalid.json'));
const expectedFragments = [
  'references missing snapshot SRC-DS-999',
  'Task-by-task mode requires task decomposition to be reached',
  'Complete workflow must be at Stage 11',
  'dependency cycle detected',
  'Passed validation requires evidence',
  'Blocked validation requires a reason',
  'Full profile requires ARCHITECTURE',
  'Complete task cannot contain failed, blocked, or unexecuted required validation',
];

const missing = expectedFragments.filter((fragment) => !invalidErrors.some((error) => error.includes(fragment)));
if (missing.length > 0) {
  console.error('Invalid fixture did not produce all expected findings:');
  missing.forEach((fragment) => console.error(`- ${fragment}`));
  console.error('\nActual findings:');
  invalidErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Workflow record validator tests passed (${invalidErrors.length} expected findings detected).`);
