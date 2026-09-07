#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_CAPABILITIES, assessCapabilities, assessPreviewEvidence, validateAcceptanceReport } from '../cli/lib/product-evidence.mjs';
import { checkReleaseReadiness } from './check-release-readiness.mjs';
import { resolveProjectSession } from '../cli/lib/project-configuration.mjs';
import { deriveNextAction } from '../cli/lib/workflow-actions.mjs';
import { buildOrchestrationContext } from '../cli/lib/orchestration-context.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Synthetic contract fixtures only. Never copy these into release/acceptance.json.
const commit = 'a'.repeat(40);
const capabilityEvidence = {
  surface: 'ordinary-chatgpt',
  capabilities: Object.fromEntries(REQUIRED_CAPABILITIES.map(name => [name, { status: 'verified', evidenceUrl: 'https://example.com/observed/' + name }])),
};
const previewEvidence = {
  repository: 'example/product', implementationCommit: commit, assetsCommitted: true,
  validation: {
    repository: 'example/product', testedCommit: commit,
    runUrl: 'https://github.com/example/product/actions/runs/123',
    checks: { dependencies: 'success', types: 'success', build: 'success', browserInstallation: 'success', browserTests: 'success' },
    passed: true,
  },
  preview: { commit, status: 'READY', inspected: true, url: 'https://product-preview.vercel.app' },
};
assert(assessCapabilities(capabilityEvidence).ready);
for (const name of REQUIRED_CAPABILITIES) {
  const missing = structuredClone(capabilityEvidence);
  delete missing.capabilities[name];
  const result = assessCapabilities(missing);
  assert(!result.ready);
  assert(result.findings.some(finding => finding.includes(name)), 'Report the specific missing capability.');
}
assert(!assessCapabilities({ ...capabilityEvidence, surface: 'codex' }).ready);
assert(assessPreviewEvidence(previewEvidence).readyForHumanReview);
assert(assessPreviewEvidence({ ...previewEvidence, bookkeepingCommit: 'b'.repeat(40) }).readyForHumanReview, 'Later bookkeeping must not invalidate matching implementation evidence.');
for (const alter of [
  value => { value.implementationCommit = 'main'; },
  value => { value.validation.testedCommit = 'b'.repeat(40); },
  value => { value.preview.commit = 'b'.repeat(40); },
  value => { value.validation.checks.types = 'failure'; },
  value => { value.validation.checks.browserTests = 'skipped'; },
  value => { value.validation.passed = false; },
  value => { value.validation.runUrl = 'https://github.com/other/product/actions/runs/123'; },
  value => { value.validation.runUrl = 123; },
  value => { value.assetsCommitted = false; },
  value => { value.preview.inspected = false; },
  value => { value.preview.status = 'BUILDING'; },
]) {
  const invalid = structuredClone(previewEvidence); alter(invalid);
  assert(!assessPreviewEvidence(invalid).readyForHumanReview);
}
const corrected = structuredClone(previewEvidence);
corrected.implementationCommit = 'c'.repeat(40);
assert(!assessPreviewEvidence(corrected).readyForHumanReview, 'A correction needs fresh validation and preview evidence.');
corrected.validation.testedCommit = corrected.implementationCommit;
corrected.preview.commit = corrected.implementationCommit;
assert(assessPreviewEvidence(corrected).readyForHumanReview);

function session(tester, persona, reviewStyle) {
  return {
    tester, persona, reviewStyle, plan: 'Plus',
    conversationUrl: 'https://chatgpt.com/share/synthetic-test',
    pullRequestUrl: 'https://github.com/example/product/pull/1',
    usedWork: false, usedCodex: false, usedLocalTerminal: false,
    result: 'passed', humanVisualAcceptance: true,
    setupSteps: 4, clarificationCount: 2, timeToFirstPreviewSeconds: 600,
    capabilityEvidence: structuredClone(capabilityEvidence), previewEvidence: structuredClone(previewEvidence),
    resumedInNewChat: true, correctionVerified: true,
  };
}
const report = {
  schemaVersion: 1, status: 'complete', testedRevision: commit,
  sessions: [session('fixture-one', 'designer-code', 'brief-and-preview'), session('fixture-two', 'engineer-figma', 'every-stage')],
};
assert(validateAcceptanceReport(report).ready);
for (const alter of [
  value => { value.status = 'pending'; },
  value => { value.sessions.pop(); },
  value => { value.sessions[1].tester = value.sessions[0].tester; },
  value => { value.sessions[1].persona = 'designer-code'; },
  value => { value.sessions[1].reviewStyle = 'brief-and-preview'; },
  value => { value.sessions[0].usedCodex = true; },
  value => { value.sessions[0].humanVisualAcceptance = false; },
  value => { value.sessions[0].timeToFirstPreviewSeconds = null; },
  value => { value.sessions[0].resumedInNewChat = false; },
  value => { value.sessions[0].correctionVerified = false; },
  value => { value.sessions[0].pullRequestUrl = 123; },
]) {
  const invalid = structuredClone(report); alter(invalid);
  assert(!validateAcceptanceReport(invalid).ready);
}
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

const temp = mkdtempSync(join(tmpdir(), 'release-readiness-'));
const git = (...args) => execFileSync('git', args, { cwd: temp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  git('init'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.com');
  writeFileSync(join(temp, 'source.txt'), 'tested source\n');
  git('add', '.'); git('commit', '-m', 'Tested source');
  const tested = git('rev-parse', 'HEAD');
  report.testedRevision = tested;
  assert(checkReleaseReadiness(report, tested, { cwd: temp }).ready);
  mkdirSync(join(temp, 'release'));
  writeFileSync(join(temp, 'release/acceptance.json'), JSON.stringify(report));
  git('add', '.'); git('commit', '-m', 'Record acceptance only');
  assert(checkReleaseReadiness(report, git('rev-parse', 'HEAD'), { cwd: temp }).ready, 'Evidence-only commits avoid a recursive commit hash requirement.');
  writeFileSync(join(temp, 'source.txt'), 'changed source\n');
  git('add', '.'); git('commit', '-m', 'Change product');
  const changed = checkReleaseReadiness(report, git('rev-parse', 'HEAD'), { cwd: temp });
  assert(!changed.ready);
  assert(changed.findings[0].includes('Source changed'));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Product contracts passed: plugin gaps, approval modes, resume rules, stale previews, failures, corrections, and release evidence.');
