const SHA = /^[0-9a-f]{40}$/i;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function https(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
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

// Combines generic implementation and deployment evidence without allowing an optional
// deployment failure to erase valid implementation evidence. Deployment findings remain
// visible on the nested result.
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
