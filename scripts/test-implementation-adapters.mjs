#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stageResources } from '../cli/lib/orchestration-resources.mjs';
import { assessImplementationEvidence } from '../cli/lib/evidence.mjs';
import {
  BASE_REQUIRED_CAPABILITIES,
  MAINTAINED_ASTRO_CHECKS,
  assessCapabilities,
  assessPreviewEvidence,
} from './lib/product-acceptance.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const record = {
  schemaVersion: 2,
  project: { name: 'Adapter fixture', profile: 'Standard', executionMode: 'Gated' },
  state: {
    stage: 0,
    status: 'In progress',
    activeInputs: [],
    currentTask: null,
    latestOutput: null,
    latestValidationRuntime: null,
    architectureDecision: null,
  },
  snapshots: [], verifications: [], artifacts: [], traceItems: [], gates: [], tasks: [],
  profileTransitions: [], implementationReviews: [],
};

const resources = stageResources(record);
assert(
  resources.required.some((resource) => resource.path === 'workflow/Implementation-Adapters.md'),
  'Stage 0 must load the canonical implementation-adapter contract.',
);
const implementationChoice = resources.conditional.find((resource) => resource.kind === 'implementation-adapter');
assert(implementationChoice, 'Orchestration must expose conditional implementation adapters.');
assert.deepEqual(
  implementationChoice.selectOneOf.map((choice) => choice.adapter).sort(),
  ['astro-typescript', 'existing-framework'],
  'Current implementation adapters must expose the maintained Astro path and best-effort existing-framework path.',
);
assert.equal(
  implementationChoice.selectOneOf.find((choice) => choice.adapter === 'astro-typescript')?.support,
  'maintained',
);
assert.equal(
  implementationChoice.selectOneOf.find((choice) => choice.adapter === 'existing-framework')?.support,
  'best-effort',
);

const contract = read('workflow/Implementation-Adapters.md');
for (const phrase of [
  'does not belong in `design-workflow.config.json` or `.workflow/workflow-record.json`',
  'Application scaffolding itself is implementation work.',
  '`design-workflow implementation scaffold astro-typescript`',
  'does not, by itself, make Stage 6 architecture required',
  'never treat it as empty merely because the framework is unfamiliar',
]) assert(contract.includes(phrase), `Implementation adapter contract must preserve: ${phrase}`);

const astro = read('implementation-adapters/ASTRO.md');
assert(astro.includes('Adapter ID: `astro-typescript`'));
assert(astro.includes('Support level: `maintained`'));
assert(astro.includes('Do not use this adapter to replace an existing non-Astro application'));
assert(astro.includes('creating application files is Stage 10 implementation work'));
assert(astro.includes('design-workflow implementation scaffold astro-typescript'));
assert(astro.includes('same resources'));
assert(
  existsSync(join(root, 'implementation-adapters', 'astro', 'scaffold', 'application', 'package.json')),
  'Maintained Astro runtime scaffold must live under the Astro adapter boundary.',
);
assert(
  existsSync(join(root, 'implementation-adapters', 'astro', 'scaffold', 'repository', 'validate-ui.yml.template')),
  'Maintained Astro scaffold must own its repository-level validation template.',
);
assert(
  !existsSync(join(root, 'starters', 'astro')),
  'The obsolete public-starter source path must not return.',
);

const existing = read('implementation-adapters/EXISTING-FRAMEWORK.md');
assert(existing.includes('Adapter ID: `existing-framework`'));
assert(existing.includes('Support level: `best-effort`'));
assert(existing.includes('Do not inject Astro'));
assert(existing.includes('Preserve the existing framework'));

const commit = 'a'.repeat(40);
const baseCapabilities = {
  surface: 'ordinary-chatgpt',
  capabilities: Object.fromEntries(BASE_REQUIRED_CAPABILITIES.map((name) => [
    name,
    { status: 'verified', evidenceUrl: `https://example.com/${name}` },
  ])),
};
assert(
  assessCapabilities(baseCapabilities).ready,
  'Repository/design workflow capabilities must be sufficient when deployment evidence is not required.',
);
assert(
  !assessCapabilities(baseCapabilities, { deploymentRequired: true }).ready,
  'A runtime-dependent acceptance path must still require deployment-inspection capability.',
);

const nativeEvidence = {
  repository: 'example/product',
  implementationCommit: commit,
  validation: {
    repository: 'example/product',
    testedCommit: commit,
    runUrl: 'https://github.com/example/product/actions/runs/123',
    checks: { build: 'success' },
    passed: true,
  },
};
assert(
  assessImplementationEvidence(nativeEvidence, { requiredChecks: ['build'] }).readyForHumanReview,
  'Existing-framework evidence must be able to pass without an unrelated preview or Astro-only checks.',
);
const missingNativeCheck = structuredClone(nativeEvidence);
missingNativeCheck.validation.checks.build = 'skipped';
assert(
  !assessImplementationEvidence(missingNativeCheck, { requiredChecks: ['build'] }).readyForHumanReview,
  'Adapter-aware evidence must still fail missing required native checks.',
);

const astroEvidence = {
  ...nativeEvidence,
  assetsCommitted: true,
  validation: {
    ...nativeEvidence.validation,
    checks: Object.fromEntries(MAINTAINED_ASTRO_CHECKS.map((name) => [name, 'success'])),
  },
  preview: {
    commit,
    status: 'READY',
    inspected: true,
    url: 'https://preview.example.com',
  },
};
assert(
  assessPreviewEvidence(astroEvidence).readyForHumanReview,
  'Legacy maintained-Astro preview assessment must retain strict validation and commit-bound runtime evidence.',
);

const experience = read('workflow/ChatGPT-Experience.md');
assert(experience.includes('implementation-environment resolution'));
assert(experience.includes('preserved through the best-effort existing-framework adapter'));
assert(experience.includes('Validation must reflect the actual repository'));

const howItWorks = read('workflow/How-It-Works.md');
assert(
  howItWorks.includes('[Implementation Adapters](Implementation-Adapters.md)'),
  'The product architecture explainer must route implementation mechanics to the canonical adapter contract.',
);
assert(
  howItWorks.includes('Adapters are capabilities underneath one product journey, not alternate workflows.'),
  'The architecture explainer must keep adapter selection out of the human product route.',
);

const semantic = JSON.parse(read('workflow/semantic-contract.json'));
assert(
  semantic.domains.some((domain) => domain.id === 'implementation-adapters'
    && domain.owner === 'workflow/Implementation-Adapters.md'),
  'Semantic contract must register implementation adapters as a canonical domain.',
);
const howItWorksEntry = semantic.entrypoints.find((entry) => entry.id === 'how-it-works');
assert(
  howItWorksEntry?.delegatesTo.includes('workflow/Implementation-Adapters.md'),
  'The architecture explainer must delegate implementation-adapter authority rather than owning it.',
);

console.log('Implementation adapter tests passed (repository-driven selection, Stage-10 runtime Astro scaffolding, maintained/best-effort boundaries, optional deployment, adapter-aware validation, and product-surface delegation).');
