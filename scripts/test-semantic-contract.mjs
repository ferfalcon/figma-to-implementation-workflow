#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  existsSync, mkdtempSync, readFileSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CONTRACT_COMPATIBILITY } from '../cli/lib/contract-compatibility.mjs';
import { commandInit } from '../cli/lib/commands-v2.mjs';
import { commandArchitecture } from '../cli/lib/commands/stage.mjs';
import {
  PROFILES, STAGES, artifactTypesForStage,
} from '../cli/lib/workflow-model.mjs';
import { loadSemanticContract, semanticContractFindings } from './generate-semantic-contract.mjs';

const sink = { write() {} };
const contract = loadSemanticContract();

assert.deepEqual(
  semanticContractFindings(contract),
  [],
  'semantic contract structure and repository references must be valid',
);
assert.equal(contract.contractVersion, 3, 'canonical Project Instructions installation authority must be represented by semantic contract v3');

function byId(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const missingProductModel = clone(contract);
delete missingProductModel.productModel;
assert.ok(
  semanticContractFindings(missingProductModel).includes('productModel must be an object'),
  'semantic validator must reject contracts without a product model',
);

const missingProgressiveInputs = clone(contract);
delete missingProgressiveInputs.productModel.progressiveInputs;
assert.ok(
  semanticContractFindings(missingProgressiveInputs).includes('productModel.progressiveInputs must be an array'),
  'semantic validator must reject product models without progressive input classification',
);

const overlappingInputLifecycle = clone(contract);
overlappingInputLifecycle.productModel.progressiveInputs.push({
  id: 'repository-url',
  requirement: 'required',
  neededBy: 'workflow-initialization',
  resolution: 'discover-or-ask',
});
assert.ok(
  semanticContractFindings(overlappingInputLifecycle).includes('input id cannot be both initial and progressive: repository-url'),
  'semantic validator must keep initial and progressive input lifecycles disjoint',
);

const productModel = contract.productModel;
assert.equal(productModel.surface, 'ordinary-chatgpt');
assert.equal(productModel.bootstrap.localDevelopmentRequired, false);
assert.equal(productModel.bootstrap.startCommand, 'Start the implementation workflow.');
assert.deepEqual(
  productModel.bootstrap.requiredInitialInputs,
  [{
    id: 'repository-url',
    host: 'Project-settings--Instructions.md',
    placeholder: '<REPOSITORY_URL>',
  }],
  'repository URL must be the single human-provided bootstrap input in the canonical installation artifact',
);

const progressiveInputs = byId(productModel.progressiveInputs);
assert.deepEqual(
  [...progressiveInputs.keys()].sort(),
  ['deployment', 'figma-design', 'figma-scope', 'review-style'],
  'progressive inputs must cover design context, review preference, and optional deployment context',
);
assert.deepEqual(progressiveInputs.get('figma-design'), {
  id: 'figma-design',
  requirement: 'required',
  neededBy: 'design-inspection',
  resolution: 'discover-or-ask',
});
assert.deepEqual(progressiveInputs.get('figma-scope'), {
  id: 'figma-scope',
  requirement: 'required',
  neededBy: 'design-mutation',
  resolution: 'discover-or-ask',
});
assert.deepEqual(progressiveInputs.get('review-style'), {
  id: 'review-style',
  requirement: 'required',
  neededBy: 'workflow-initialization',
  resolution: 'ask-once',
});
assert.deepEqual(progressiveInputs.get('deployment'), {
  id: 'deployment',
  requirement: 'optional',
  neededBy: 'preview',
  resolution: 'discover-when-relevant',
});
assert.equal(productModel.interactionPolicy.inferWhenSafe, true);
assert.deepEqual(productModel.interactionPolicy.askOnlyFor, [
  'consequential-decisions',
  'missing-required-information',
  'missing-required-capabilities',
  'real-blockers',
]);

const entrypoints = byId(contract.entrypoints);
for (const required of [
  'readme',
  'quickstart',
  'toolkit-agents',
  'consumer-agent-bootstrap',
  'chatgpt-project-settings',
  'figma-preparation-launcher',
  'contributing',
]) {
  assert.ok(entrypoints.has(required), `semantic contract must register ${required}`);
}
assert.equal(entrypoints.get('readme').role, 'human product overview and zero-to-start instructions');
assert.ok(entrypoints.get('readme').owns.includes('repository-url-first start'));
assert.ok(entrypoints.get('readme').delegatesTo.includes('Project-settings--Instructions.md'));
assert.equal(entrypoints.get('quickstart').role, 'detailed first-run and resume guide');
assert.ok(entrypoints.get('quickstart').owns.includes('progressive setup and capability resolution'));
assert(!entrypoints.get('quickstart').owns.includes('one-time plugin and starter setup'));
assert(!entrypoints.get('quickstart').owns.includes('Figma-first start and review preference choice'));
assert.equal(entrypoints.get('consumer-agent-bootstrap').path, 'AGENTS-instructions.md');
assert.ok(entrypoints.get('consumer-agent-bootstrap').delegatesTo.includes('workflow/Agent-Orchestration.md'));
assert.equal(entrypoints.get('chatgpt-project-settings').path, 'Project-settings--Instructions.md');
assert.equal(entrypoints.get('chatgpt-project-settings').role, 'canonical ChatGPT installation artifact and host bootstrap contract');
assert.ok(entrypoints.get('chatgpt-project-settings').owns.includes('canonical Project Instructions installation artifact'));
assert.deepEqual(entrypoints.get('chatgpt-project-settings').delegatesTo, ['AGENTS-instructions.md', 'workflow/Project-Configuration.md', 'workflow/ChatGPT-Experience.md']);
assert(entrypoints.get('quickstart').delegatesTo.includes('workflow/ChatGPT-Experience.md'));
assert(!entrypoints.get('quickstart').owns.includes('profile-selection onboarding'));
assert.deepEqual(entrypoints.get('figma-preparation-launcher').delegatesTo, ['source-adapters/FIGMA-PREPARATION.md']);

const controlModes = byId(contract.controlModes);
assert.deepEqual(
  [...controlModes.keys()].sort(),
  ['cli-managed', 'markdown-only'],
  'semantic contract control modes must match the supported initialization modes',
);

for (const mode of controlModes.values()) {
  const directory = mkdtempSync(join(tmpdir(), `design-workflow-semantic-${mode.id}-`));
  try {
    const code = commandInit(directory, sink, sink, {
      name: 'Semantic contract control-mode test',
      profile: 'Express',
      mode: 'Gated',
      control: mode.id,
    });
    assert.equal(code, 0, `${mode.id} initialization must succeed`);

    const recordExists = existsSync(join(directory, '.workflow', 'workflow-record.json'));
    assert.equal(
      recordExists,
      mode.executable,
      `${mode.id} executable flag must match whether initialization creates canonical workflow state`,
    );
    if (mode.id === 'markdown-only') {
      assert.ok(existsSync(join(directory, 'WORKPACK.md')), 'Markdown-only mode must scaffold narrative control');
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

assert.equal(
  contract.architecture.stage,
  STAGES.indexOf('Define or explicitly skip architecture'),
  'architecture contract must identify the executable architecture stage',
);
assert.equal(contract.architecture.decisionRequired, true);
assert.deepEqual(
  Object.keys(contract.architecture.profiles),
  PROFILES,
  'architecture contract must cover every executable workflow profile',
);

for (const profile of PROFILES) {
  const rule = contract.architecture.profiles[profile];
  const requiredTargets = artifactTypesForStage(profile, contract.architecture.stage, { result: 'Required' });
  const skippedTargets = artifactTypesForStage(profile, contract.architecture.stage, { result: 'Not required' });
  const requiredHasArchitecture = requiredTargets.includes('ARCHITECTURE');
  const skippedHasArchitecture = skippedTargets.includes('ARCHITECTURE');

  if (rule.artifactPolicy === 'never') {
    assert.equal(requiredHasArchitecture, false, `${profile} must not create an architecture artifact before upgrade`);
    assert.equal(skippedHasArchitecture, false, `${profile} must not create an architecture artifact when skipped`);
  } else if (rule.artifactPolicy === 'required-when-required') {
    assert.equal(requiredHasArchitecture, true, `${profile} must require ARCHITECTURE when architecture is required`);
    assert.equal(skippedHasArchitecture, false, `${profile} must omit ARCHITECTURE when architecture is not required`);
  } else if (rule.artifactPolicy === 'required') {
    assert.equal(requiredHasArchitecture, true, `${profile} must include ARCHITECTURE when architecture is required`);
    assert.equal(skippedHasArchitecture, true, `${profile} must include ARCHITECTURE even when the decision is not-required`);
  } else {
    assert.fail(`Unknown architecture artifact policy for ${profile}: ${rule.artifactPolicy}`);
  }

  const directory = mkdtempSync(join(tmpdir(), `design-workflow-semantic-architecture-${profile.toLowerCase()}-`));
  try {
    assert.equal(commandInit(directory, sink, sink, {
      name: 'Semantic contract architecture test',
      profile,
      mode: 'Gated',
      control: 'cli-managed',
    }), 0);
    assert.equal(commandArchitecture(
      directory,
      sink,
      sink,
      ['architecture', 'decide', 'required'],
      { reason: 'Semantic contract behavior test' },
    ), 0);

    const record = JSON.parse(readFileSync(join(directory, '.workflow', 'workflow-record.json'), 'utf8'));
    assert.equal(
      record.state.status === 'Blocked',
      rule.requiredDecisionOutcome === 'must-upgrade',
      `${profile} required-architecture outcome must match the semantic contract`,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

assert.equal(contract.compatibility.owner, 'cli/lib/contract-compatibility.mjs');
assert.equal(contract.compatibility.humanProjection, 'workflow/Contract-Compatibility.md');
assert.deepEqual(
  [...contract.compatibility.contracts].sort(),
  CONTRACT_COMPATIBILITY.map((item) => item.id).sort(),
  'semantic compatibility coverage must track every canonical compatibility contract without duplicating versions',
);

console.log('Semantic contract tests passed (canonical installation artifact, product onboarding, entrypoint ownership, control modes, architecture rules, and compatibility coverage agree with executable behavior).');
