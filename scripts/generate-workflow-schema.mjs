#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorkflowRecordSchemaV2 } from '../cli/lib/workflow-schema.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, '..');
const schemaPath = join(root, 'schemas', 'workflow-record.schema.json');
const rendered = `${JSON.stringify(buildWorkflowRecordSchemaV2(), null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = readFileSync(schemaPath, 'utf8');
  if (current !== rendered) {
    process.stderr.write('schemas/workflow-record.schema.json is stale. Run npm run schema:write.\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('Workflow schema is current.\n');
  }
} else {
  writeFileSync(schemaPath, rendered, 'utf8');
  process.stdout.write('Updated schemas/workflow-record.schema.json.\n');
}

