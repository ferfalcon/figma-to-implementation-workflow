#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_CAPABILITIES,
  DEPLOYMENT_INSPECTION_CAPABILITY,
  MAINTAINED_ASTRO_CHECKS,
  assessCapabilities,
  assessImplementationEvidence,
  assessDeploymentEvidence,
  assessReviewEvidence,
  assessPreviewEvidence,
  validateAcceptanceReport,
} from '../cli/lib/product-evidence.mjs';
import { resolveProjectSession } from '../cli/lib/project-configuration.mjs';
import { deriveNextAction } from '../cli/lib/workflow-actions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Synthetic contract fixtures only. They validate evidence shape, not real-user acceptance.
const commit = 'a'.repeat(40);
const capabilityEvidence = {
  surface: 'ordinary-chatgpt',
  capabilities: Object.fromEntries(REQUIRED_CAPABILITIES.map(name => [name, { status: 'verified', evidenceUrl: 'https://example.com/observed/' + name }])),
};
const capabilityEvidenceWithDeployment = structuredClone(capabilityEvidence);
capabilityEvidenceWithDeployment.capabilities[DEPLOYMENT_INSPECTION_CAPABILITY] = {
  status: 'verified', evidenceUrl: 'https://example.com/observed/deployment',
};

const implementationEvidence = {
  repository: 'example/product', implementationCommit: commit, assetsCommitted: true,
  validation: {
    repository: 'example/product', testedCommit: commit,
    runUrl: 'https://github.com/example/product/actions/runs/123',
    checks: { dependencies: 'success', types: 'success', build: 'success', browserInstallation: 'success', browserTests: 'success' },
    passed: true,
  },
};
const deploymentEvidence = {
  provider: 'vercel', implementationCommit: commit,
  deployment: { commit, status: 'ready', inspected: true, url: 'https://product-preview.vercel.app' },
};

assert(assessCapabilities(capabilityEvidence).ready, 'Deployment inspection must not be a global prerequisite.');
for (const name of REQUIRED_CAPABILITIES) {
  const missing = structuredClone(capabilityEvidence);
  delete missing.capabilities[name];
  const result = assessCapabilities(missing);
  assert(!result.ready);
  assert(result.findings.some(finding => finding.includes(name)), 'Report the specific missing core capability.');
}
assert(!assessCapabilities(capabilityEvidence, { deploymentRequired: true }).ready, 'Required deployment inspection must be enforced conditionally.');
assert(assessCapabilities(capabilityEvidenceWithDeployment, { deploymentRequired: true }).ready);
assert(!assessCapabilities({ ...capabilityEvidence, surface: 'codex' }).ready);

assert(assessImplementationEvidence(implementationEvidence, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
}).readyForHumanReview);
assert.deepEqual(assessDeploymentEvidence(null), { status: 'not-configured', ready: true, findings: [] });
assert.equal(assessDeploymentEvidence(null, { required: true, implementationCommit: commit }).status, 'blocked');

const noDeploymentReview = assessReviewEvidence({ implementationEvidence, deploymentEvidence: null }, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
});
assert(noDeploymentReview.readyForHumanReview, 'Implementation evidence must be reviewable without deployment.');
assert.equal(noDeploymentReview.deployment.status, 'not-configured');

const optionalBrokenDeployment = structuredClone(deploymentEvidence);
optionalBrokenDeployment.deployment.commit = 'b'.repeat(40);
const optionalDeploymentReview = assessReviewEvidence({ implementationEvidence, deploymentEvidence: optionalBrokenDeployment }, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
  deploymentRequired: false,
});
assert(optionalDeploymentReview.readyForHumanReview, 'Broken optional runtime evidence must not erase valid implementation evidence.');
assert.equal(optionalDeploymentReview.deployment.status, 'blocked');
assert(optionalDeploymentReview.deployment.findings.length > 0, 'Optional deployment limitations must remain visible.');

const requiredDeploymentReview = assessReviewEvidence({ implementationEvidence, deploymentEvidence }, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
  deploymentRequired: true,
});
assert(requiredDeploymentReview.readyForHumanReview);
for (const alter of [
  value => { value.implementationCommit = 'b'.repeat(40); },
  value => { value.deployment.commit = 'b'.repeat(40); },
  value => { value.deployment.status = 'building'; },
  value => { value.deployment.inspected = false; },
  value => { value.deployment.url = 'http://example.test'; },
]) {
  const invalid = structuredClone(deploymentEvidence); alter(invalid);
  const result = assessReviewEvidence({ implementationEvidence, deploymentEvidence: invalid }, {
    requiredChecks: MAINTAINED_ASTRO_CHECKS,
    assetsRequired: true,
    deploymentRequired: true,
  });
  assert(!result.readyForHumanReview);
}
for (const alter of [
  value => { value.implementationCommit = 'main'; },
  value => { value.validation.testedCommit = 'b'.repeat(40); },
  value => { value.validation.checks.types = 'failure'; },
  value => { value.validation.checks.browserTests = 'skipped'; },
  value => { value.validation.passed = false; },
  value => { value.validation.runUrl = 'https://github.com/other/product/actions/runs/123'; },
  value => { value.validation.runUrl = 123; },
  value => { value.assetsCommitted = false; },
]) {
  const invalid = structuredClone(implementationEvidence); alter(invalid);
  assert(!assessImplementationEvidence(invalid, {
    requiredChecks: MAINTAINED_ASTRO_CHECKS,
    assetsRequired: true,
  }).readyForHumanReview);
}

const legacyPreviewEvidence = {
  ...structuredClone(implementationEvidence),
  preview: { commit, status: 'READY', inspected: true, url: 'https://product-preview.vercel.app' },
};
assert(assessPreviewEvidence(legacyPreviewEvidence).readyForHumanReview, 'Legacy preview-shaped assessment must remain strict and compatible.');
legacyPreviewEvidence.preview.commit = 'b'.repeat(40);
assert(!assessPreviewEvidence(legacyPreviewEvidence).readyForHumanReview);

const correctedImplementation = structuredClone(implementationEvidence);
correctedImplementation.implementationCommit = 'c'.repeat(40);
assert(!assessImplementationEvidence(correctedImplementation, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
}).readyForHumanReview, 'A correction needs fresh implementation validation evidence.');
correctedImplementation.validation.testedCommit = correctedImplementation.implementationCommit;
assert(assessImplementationEvidence(correctedImplementation, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
}).readyForHumanReview);
assert(!assessReviewEvidence({ implementationEvidence: correctedImplementation, deploymentEvidence }, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
  deploymentRequired: true,
}).readyForHumanReview, 'A replacement implementation commit needs fresh required deployment evidence.');
const correctedDeployment = structuredClone(deploymentEvidence);
correctedDeployment.implementationCommit = correctedImplementation.implementationCommit;
correctedDeployment.deployment.commit = correctedImplementation.implementationCommit;
assert(assessReviewEvidence({ implementationEvidence: correctedImplementation, deploymentEvidence: correctedDeployment }, {
  requiredChecks: MAINTAINED_ASTRO_CHECKS,
  assetsRequired: true,
  deploymentRequired: true,
}).readyForHumanReview);

function session(tester, persona, reviewStyle, deploymentRequired) {
  const capabilities = structuredClone(capabilityEvidence);
  if (deploymentRequired) {
    capabilities.capabilities[DEPLOYMENT_INSPECTION_CAPABILITY] = {
      status: 'verified', evidenceUrl: 'https://example.com/observed/deployment',
    };
  }
  return {
    tester, persona, reviewStyle, plan: 'Plus',
    conversationUrl: 'https://chatgpt.com/share/synthetic-test',
    pullRequestUrl: 'https://github.com/example/product/pull/1',
    usedWork: false, usedCodex: false, usedLocalTerminal: false,
    result: 'passed', humanAcceptance: true,
    setupSteps: 4, clarificationCount: 2, timeToFirstVerifiedResultSeconds: 450,
    deploymentRequired,
    timeToFirstPreviewSeconds: deploymentRequired ? 600 : null,
    humanVisualAcceptance: deploymentRequired ? true : null,
    capabilityEvidence: capabilities,
    implementationEvidence: structuredClone(implementationEvidence),
    deploymentEvidence: deploymentRequired ? structuredClone(deploymentEvidence) : null,
    resumedInNewChat: true, correctionVerified: true,
  };
}
const report = {
  schemaVersion: 2, status: 'complete', testedRevision: commit,
  sessions: [
    session('fixture-one', 'designer-code', 'brief-and-preview', false),
    session('fixture-two', 'engineer-figma', 'every-stage', true),
  ],
};
assert(validateAcceptanceReport(report).ready);
for (const alter of [
  value => { value.status = 'pending'; },
  value => { value.sessions.pop(); },
  value => { value.sessions[1].tester = value.sessions[0].tester; },
  value => { value.sessions[1].persona = 'designer-code'; },
  value => { value.sessions[1].reviewStyle = 'brief-and-preview'; },
  value => { value.sessions[0].usedCodex = true; },
  value => { value.sessions[0].humanAcceptance = false; },
  value => { value.sessions[0].timeToFirstVerifiedResultSeconds = null; },
  value => { value.sessions[0].resumedInNewChat = false; },
  value => { value.sessions[0].correctionVerified = false; },
  value => { value.sessions[0].pullRequestUrl = 123; },
  value => { value.sessions[0].deploymentEvidence = structuredClone(deploymentEvidence); },
  value => { value.sessions[0].humanVisualAcceptance = true; },
  value => { value.sessions[1].deploymentEvidence.deployment.commit = 'b'.repeat(40); },
  value => { value.sessions[1].timeToFirstPreviewSeconds = null; },
  value => { value.sessions[1].humanVisualAcceptance = false; },
]) {
  const invalid = structuredClone(report); alter(invalid);
  assert(!validateAcceptanceReport(invalid).ready);
}
const onlyDeployment = structuredClone(report);
onlyDeployment.sessions[0] = session('fixture-one', 'designer-code', 'brief-and-preview', true);
assert(!validateAcceptanceReport(onlyDeployment).ready, 'Acceptance must prove the no-deployment path.');
const noDeploymentOnly = structuredClone(report);
noDeploymentOnly.sessions[1] = session('fixture-two', 'engineer-figma', 'every-stage', false);
assert(!validateAcceptanceReport(noDeploymentOnly).ready, 'Acceptance must prove a deployment-required path.');
assert(!validateAcceptanceReport(null).ready);
assert(!validateAcceptanceReport(JSON.parse(readFileSync(join(root, 'templates/PRODUCT-ACCEPTANCE.template.json'), 'utf8'))).ready);

const config = {
  schemaVersion: 2, project: { name: 'Fixture' },
  repository: { url: 'https://github.com/example/product', implementationRoot: '.', workingBranch: 'design/initial-ui' },
  design: { provider: 'figma', url: 'https://www.figma.com/design/file', scope: 'Home' },
  deployment: { vercelProjectUrl: null, productionUrl: null }, workflow: { reviewStyle: 'brief-and-preview' },
};
const record = {
  schemaVersion: 2, project: { name: 'Fixture', profile: 'Express', executionMode: resolveProjectSession(config).initialMode },
  state: { stage: 9, status: 'Ready', activeInputs: [], currentTask: null, latestOutput: null, latestValidationRuntime: null, architectureDecision: null },
  snapshots: [], verifications: [], artifacts: [], traceItems: [], gates: [{ stage: 9, status: 'Active', result: 'Passed' }],
  tasks: [{ id: 'P01-T01', status: 'Ready', prerequisites: [] }], profileTransitions: [], implementationReviews: [],
};
assert.match(deriveNextAction(record), /Switch execution mode/, 'Brief review must stop before implementation.');
record.project.executionMode = 'Task-by-task'; // Models the existing command after explicit scope approval.
assert.match(deriveNextAction(record), /Advance to Stage 10/);
record.state.stage = 10;
assert.equal(deriveNextAction(record), 'Start P01-T01.');
config.workflow.reviewStyle = 'every-stage';
assert.equal(resolveProjectSession(config).initialMode, 'Gated');
const contract = readFileSync(join(root, 'workflow/ChatGPT-Experience.md'), 'utf8');
for (const phrase of ['Only after explicit approval', 'rerun preflight/review', 'approved tasks sequentially', 'explicit human final acceptance', 'Do not fall back to default-branch workflow state']) assert(contract.includes(phrase), phrase);
const deploymentContract = readFileSync(join(root, 'workflow/Deployment-Adapters.md'), 'utf8');
for (const phrase of ['An implementation does not require a deployment to be valid.', 'Not configured', 'Available', 'Blocked', 'exact tested implementation commit']) assert(deploymentContract.includes(phrase), phrase);

const retiredPublicationPaths = [
  '.github/workflows/release-consumer-bundle.yml',
  'release/acceptance.json',
  'scripts/check-release-readiness.mjs',
  'scripts/publish-astro-starter.mjs',
  'scripts/test-publish-astro-starter.mjs',
];
for (const path of retiredPublicationPaths) {
  assert(!existsSync(join(root, path)), `Retired public publication artifact must stay deleted: ${path}`);
}
const acceptanceContract = readFileSync(join(root, 'workflow/Product-Acceptance.md'), 'utf8');
for (const phrase of ['STARTER_PUBLISH_TOKEN', 'STARTER_TEMPLATE_REPOSITORY', 'release/acceptance.json', 'Publish after acceptance']) {
  assert(!acceptanceContract.includes(phrase), `Product acceptance must not restore release publication coupling: ${phrase}`);
}

console.log('Product contracts passed: core capability gaps, optional deployment, required runtime evidence, approval modes, resume rules, corrections, product acceptance evidence, and retired publication surfaces.');
