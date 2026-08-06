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

function expectValid(name) {
  const errors = validateWorkflowRecord(readFixture(name));
  if (errors.length > 0) {
    console.error(`Expected ${name} to pass:`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
}

expectValid('workflow-record.valid.json');
expectValid('workflow-record.express.valid.json');

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

const invalidExpress = structuredClone(readFixture('workflow-record.express.valid.json'));
invalidExpress.artifacts.push({
  id: 'ART-PLAN',
  type: 'PLAN',
  status: 'Approved',
  baseline: ['SRC-REPO-001'],
});
invalidExpress.tasks[0].prerequisites = ['P01-T02'];
invalidExpress.tasks.push({
  id: 'P01-T02',
  status: 'Ready',
  baseline: 'SRC-REPO-001',
  prerequisites: [],
  references: ['AC-002'],
  output: null,
  validation: [
    {
      name: 'Second task validation',
      status: 'Not executed',
      reason: 'Second task should force a profile upgrade',
    },
  ],
});

const invalidExpressErrors = validateWorkflowRecord(invalidExpress);
const expectedExpressFragments = [
  'Express profile must consolidate PLAN responsibility in WORKPACK',
  'Express profile permits at most one implementation task',
  'Express task cannot have task prerequisites',
];

const missingExpress = expectedExpressFragments.filter(
  (fragment) => !invalidExpressErrors.some((error) => error.includes(fragment)),
);
if (missingExpress.length > 0) {
  console.error('Invalid Express record did not produce all expected findings:');
  missingExpress.forEach((fragment) => console.error(`- ${fragment}`));
  console.error('\nActual findings:');
  invalidExpressErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Workflow record validator tests passed (${invalidErrors.length + invalidExpressErrors.length} expected findings detected across general and Express cases).`,
);
