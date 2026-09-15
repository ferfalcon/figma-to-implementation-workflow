export const BASE_REQUIRED_CAPABILITIES = [
  'figmaDesign', 'githubWrites', 'commandIssues', 'actionsLogs',
];

// Core product capabilities. Deployment inspection is conditional and must not be
// treated as a global prerequisite for implementation readiness.
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
  } catch { return false; }
}

function verifiedCapability(evidence, name) {
  const capability = evidence?.capabilities?.[name];
  return capability?.status === 'verified' && https(capability?.evidenceUrl);
}

// Checks the shape and completeness of observed capabilities. This does not call
// providers or grant permissions; observations must come from actual connected tools.
// Deployment inspection is conditional. `previewRequired` remains as a compatibility
// option for callers that have not yet adopted the provider-neutral name.
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

// Implementation evidence is provider-neutral. It proves the repository output and
// applicable automated validation independently from any deployment/runtime layer.
export function assessImplementationEvidence(evidence, {
  requiredChecks = [],
  assetsRequired = false,
} = {}) {
  const findings = [];
  const commit = evidence?.implementationCommit;
  if (!SHA.test(commit || '')) findings.push('An exact implementation commit is required.');

  const validation = evidence?.validation;
  if (validation?.testedCommit !== commit) findings.push('Validation is for a different implementation commit.');
  if (!https(validation?.runUrl)) findings.push('A validation evidence URL is required.');
  if (typeof evidence?.repository !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(evidence.repository)
    || validation?.repository !== evidence.repository) findings.push('Validation repository identity does not match.');
  if (evidence?.repository && typeof validation?.runUrl === 'string' && validation.runUrl.startsWith('https://github.com/')
    && !validation.runUrl.startsWith('https://github.com/' + evidence.repository + '/')) {
    findings.push('Validation run belongs to another repository.');
  }
  for (const name of requiredChecks) {
    if (validation?.checks?.[name] !== 'success') findings.push('Required check is not successful: ' + name);
  }
  if (validation?.passed !== true) findings.push('Validation has not passed.');
  if (assetsRequired && evidence?.assetsCommitted !== true) findings.push('Required design assets have not been committed.');

  return { readyForHumanReview: findings.length === 0, findings };
}

// Provider adapters normalize deployment/runtime observations before this assessment.
// Missing optional deployment evidence is Not configured, not a failed implementation.
export function assessDeploymentEvidence(evidence, {
  required = false,
  implementationCommit = evidence?.implementationCommit ?? null,
} = {}) {
  if (evidence === null || evidence === undefined) {
    const findings = required ? ['Deployment evidence is required but was not provided.'] : [];
    return {
      status: required ? 'blocked' : 'not-configured',
      ready: !required,
      findings,
    };
  }

  const findings = [];
  if (!object(evidence)) {
    return { status: 'blocked', ready: false, findings: ['Deployment evidence must be an object.'] };
  }
  if (!SHA.test(implementationCommit || '')) findings.push('Deployment evidence requires an exact implementation commit.');
  if (evidence.implementationCommit !== implementationCommit) {
    findings.push('Deployment evidence is for a different implementation commit.');
  }
  if (typeof evidence.provider !== 'string' || !evidence.provider.trim()) {
    findings.push('Deployment evidence requires a provider identifier.');
  }

  const deployment = evidence.deployment;
  if (!object(deployment)) {
    findings.push('Deployment evidence requires an inspected deployment.');
  } else {
    if (deployment.commit !== implementationCommit) findings.push('Deployment is for a different implementation commit.');
    if (deployment.status !== 'ready') findings.push('Deployment is not in normalized ready state.');
    if (deployment.inspected !== true || !https(deployment.url)) {
      findings.push('The matching deployment must be actually inspected at an HTTPS URL.');
    }
  }

  return {
    status: findings.length === 0 ? 'verified' : 'blocked',
    ready: findings.length === 0,
    findings,
  };
}

// Combines evidence without allowing an optional deployment failure to erase valid
// implementation evidence. Deployment findings remain visible on the nested result.
export function assessReviewEvidence({
  implementationEvidence,
  deploymentEvidence = null,
} = {}, {
  requiredChecks = [],
  assetsRequired = false,
  deploymentRequired = false,
} = {}) {
  const implementation = assessImplementationEvidence(implementationEvidence, {
    requiredChecks,
    assetsRequired,
  });
  const deployment = assessDeploymentEvidence(deploymentEvidence, {
    required: deploymentRequired,
    implementationCommit: implementationEvidence?.implementationCommit ?? null,
  });

  const findings = [
    ...implementation.findings,
    ...(deploymentRequired ? deployment.findings : []),
  ];
  return {
    readyForHumanReview: implementation.readyForHumanReview && (!deploymentRequired || deployment.ready),
    findings,
    implementation,
    deployment,
  };
}

// Compatibility adapter for older preview-shaped evidence. It preserves strict
// maintained-Astro preview verification while new product code uses the deployment
// evidence contract above.
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
    if (!object(session)) { findings.push(prefix + 'must be an object.'); continue; }
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
    findings.push(...capability.findings.map(finding => prefix + finding));

    const implementation = assessImplementationEvidence(implementationEvidence, {
      requiredChecks: MAINTAINED_ASTRO_CHECKS,
      assetsRequired: true,
    });
    findings.push(...implementation.findings.map(finding => prefix + finding));

    const deployment = assessDeploymentEvidence(session.deploymentEvidence, {
      required: deploymentRequired,
      implementationCommit: implementationEvidence?.implementationCommit ?? null,
    });
    if (deploymentRequired) {
      deploymentScenario = true;
      findings.push(...deployment.findings.map(finding => prefix + finding));
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
