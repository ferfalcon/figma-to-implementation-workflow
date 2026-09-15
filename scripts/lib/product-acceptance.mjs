import {
  assessDeploymentEvidence,
  assessImplementationEvidence,
  assessReviewEvidence,
} from '../../cli/lib/evidence.mjs';

export const BASE_REQUIRED_CAPABILITIES = [
  'figmaDesign', 'githubWrites', 'commandIssues', 'actionsLogs',
];

// Product capability observations belong to maintainer acceptance, not the runtime CLI.
// Deployment inspection is conditional and must not be treated as a global prerequisite.
export const REQUIRED_CAPABILITIES = [...BASE_REQUIRED_CAPABILITIES];
export const DEPLOYMENT_INSPECTION_CAPABILITY = 'deploymentInspection';
export const LEGACY_PREVIEW_INSPECTION_CAPABILITY = 'previewInspection';

export const MAINTAINED_ASTRO_CHECKS = [
  'dependencies', 'types', 'build', 'browserInstallation', 'browserTests',
];

const SHA = /^[0-9a-f]{40}$/i;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function https(value, host) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      && (!host || url.hostname === host);
  } catch {
    return false;
  }
}

function verifiedCapability(evidence, name) {
  const capability = evidence?.capabilities?.[name];
  return capability?.status === 'verified' && https(capability?.evidenceUrl);
}

// Checks observed ChatGPT product capabilities. This does not call providers or grant
// permissions; observations must come from actual connected tools.
// `previewRequired` remains as a compatibility option for older acceptance fixtures.
export function assessCapabilities(evidence, {
  deploymentRequired = false,
  previewRequired,
} = {}) {
  const findings = [];
  if (evidence?.surface !== 'ordinary-chatgpt') findings.push('Required surface is ordinary ChatGPT.');

  for (const name of REQUIRED_CAPABILITIES) {
    if (!verifiedCapability(evidence, name)) {
      findings.push(name + ' has not been verified with provider evidence.');
    }
  }

  const requireDeployment = previewRequired === undefined ? deploymentRequired : previewRequired;
  if (requireDeployment) {
    const verified = verifiedCapability(evidence, DEPLOYMENT_INSPECTION_CAPABILITY)
      || verifiedCapability(evidence, LEGACY_PREVIEW_INSPECTION_CAPABILITY);
    if (!verified) {
      findings.push(DEPLOYMENT_INSPECTION_CAPABILITY + ' has not been verified with provider evidence.');
    }
  }

  return { ready: findings.length === 0, findings };
}

// Compatibility adapter for older preview-shaped product acceptance evidence. Generic
// runtime evidence assessment stays in cli/lib/evidence.mjs.
export function assessPreviewEvidence(evidence) {
  const preview = evidence?.preview;
  const deploymentEvidence = preview === undefined || preview === null ? null : {
    provider: 'vercel',
    implementationCommit: evidence?.implementationCommit,
    deployment: {
      commit: preview.commit,
      status: preview.status === 'READY' ? 'ready' : String(preview.status ?? '').toLowerCase(),
      url: preview.url,
      inspected: preview.inspected,
    },
  };
  return assessReviewEvidence({
    implementationEvidence: evidence,
    deploymentEvidence,
  }, {
    requiredChecks: MAINTAINED_ASTRO_CHECKS,
    assetsRequired: true,
    deploymentRequired: true,
  });
}

export function validateAcceptanceReport(report) {
  const findings = [];
  if (!object(report) || report.schemaVersion !== 2) findings.push('Acceptance report schemaVersion must be 2.');
  if (report?.status !== 'complete') findings.push('Real-user acceptance is still pending.');
  if (!SHA.test(report?.testedRevision || '')) findings.push('Acceptance must name the exact tested toolkit revision.');
  if (!Array.isArray(report?.sessions) || report.sessions.length < 2) findings.push('Two real personal-ChatGPT tester sessions are required.');

  const sessions = Array.isArray(report?.sessions) ? report.sessions : [];
  const personas = new Set();
  const styles = new Set();
  const testers = new Set();
  let noDeploymentScenario = false;
  let deploymentScenario = false;

  for (const [index, session] of sessions.entries()) {
    const prefix = 'Session ' + (index + 1) + ': ';
    if (!object(session)) {
      findings.push(prefix + 'must be an object.');
      continue;
    }
    if (typeof session.tester !== 'string' || !session.tester.trim() || /[<>]/.test(session.tester)) findings.push(prefix + 'a real tester identifier is required.');
    else testers.add(session.tester.trim().toLowerCase());
    if (!['designer-code', 'engineer-figma'].includes(session.persona)) findings.push(prefix + 'unsupported persona.');
    else personas.add(session.persona);
    if (!['brief-and-preview', 'every-stage'].includes(session.reviewStyle)) findings.push(prefix + 'unsupported review style.');
    else styles.add(session.reviewStyle);
    if (!['Plus', 'Pro'].includes(session.plan)) findings.push(prefix + 'a personal Plus or Pro plan is required.');
    if (!https(session.conversationUrl, 'chatgpt.com')) findings.push(prefix + 'conversation evidence is required.');
    if (!https(session.pullRequestUrl, 'github.com') || !/\/pull\/\d+\/?$/.test(session.pullRequestUrl || '')) findings.push(prefix + 'a pull request is required.');

    const implementationEvidence = session.implementationEvidence;
    if (implementationEvidence?.repository && (typeof session.pullRequestUrl !== 'string'
      || !session.pullRequestUrl.startsWith('https://github.com/' + implementationEvidence.repository + '/pull/'))) {
      findings.push(prefix + 'pull request repository does not match the implementation evidence.');
    }

    if (session.usedWork !== false || session.usedCodex !== false || session.usedLocalTerminal !== false) findings.push(prefix + 'must complete without Work, Codex, or a local terminal.');
    if (session.result !== 'passed' || session.humanAcceptance !== true) findings.push(prefix + 'explicit human acceptance and a passing result are required.');
    if (typeof session.deploymentRequired !== 'boolean') findings.push(prefix + 'deploymentRequired must be boolean.');

    for (const name of ['setupSteps', 'clarificationCount']) {
      if (!Number.isInteger(session[name]) || session[name] < 0) findings.push(prefix + name + ' must be recorded.');
    }
    if (!Number.isFinite(session.timeToFirstVerifiedResultSeconds) || session.timeToFirstVerifiedResultSeconds <= 0) {
      findings.push(prefix + 'timeToFirstVerifiedResultSeconds must be recorded.');
    }

    const deploymentRequired = session.deploymentRequired === true;
    const capability = assessCapabilities(session.capabilityEvidence, { deploymentRequired });
    findings.push(...capability.findings.map((finding) => prefix + finding));

    const implementation = assessImplementationEvidence(implementationEvidence, {
      requiredChecks: MAINTAINED_ASTRO_CHECKS,
      assetsRequired: true,
    });
    findings.push(...implementation.findings.map((finding) => prefix + finding));

    const deployment = assessDeploymentEvidence(session.deploymentEvidence, {
      required: deploymentRequired,
      implementationCommit: implementationEvidence?.implementationCommit ?? null,
    });
    if (deploymentRequired) {
      deploymentScenario = true;
      findings.push(...deployment.findings.map((finding) => prefix + finding));
      if (!Number.isFinite(session.timeToFirstPreviewSeconds) || session.timeToFirstPreviewSeconds <= 0) {
        findings.push(prefix + 'timeToFirstPreviewSeconds must be recorded when deployment evidence is required.');
      }
      if (session.humanVisualAcceptance !== true) {
        findings.push(prefix + 'deployment scenario requires human visual acceptance.');
      }
    } else {
      if (session.deploymentEvidence !== null) {
        findings.push(prefix + 'no-deployment acceptance scenario must keep deploymentEvidence null.');
      }
      if (session.timeToFirstPreviewSeconds !== null) {
        findings.push(prefix + 'no-deployment acceptance scenario must keep timeToFirstPreviewSeconds null.');
      }
      if (session.humanVisualAcceptance !== null) {
        findings.push(prefix + 'no-deployment acceptance scenario must not claim runtime visual acceptance.');
      }
      noDeploymentScenario = true;
    }

    if (session.resumedInNewChat !== true || session.correctionVerified !== true) findings.push(prefix + 'new-chat resume and a verified correction must be exercised.');
  }

  if (testers.size < 2) findings.push('Acceptance requires two distinct real testers.');
  if (personas.size < 2) findings.push('Both personas must be represented.');
  if (styles.size < 2) findings.push('Both review styles must be exercised.');
  if (!noDeploymentScenario) findings.push('Acceptance must include a passing no-deployment scenario.');
  if (!deploymentScenario) findings.push('Acceptance must include a passing deployment-required scenario.');
  return { ready: findings.length === 0, findings };
}
