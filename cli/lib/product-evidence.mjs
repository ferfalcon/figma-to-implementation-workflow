export const REQUIRED_CAPABILITIES = [
  'figmaDesign', 'githubWrites', 'commandIssues', 'actionsLogs', 'previewInspection',
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

// Checks the shape and completeness of observed evidence. This does not call providers
// or grant permissions; observations must come from the actual connected tools.
export function assessCapabilities(evidence) {
  const findings = [];
  if (evidence?.surface !== 'ordinary-chatgpt') findings.push('Required surface is ordinary ChatGPT.');
  for (const name of REQUIRED_CAPABILITIES) {
    const capability = evidence?.capabilities?.[name];
    if (capability?.status !== 'verified' || !https(capability?.evidenceUrl)) {
      findings.push(name + ' has not been verified with provider evidence.');
    }
  }
  return { ready: findings.length === 0, findings };
}

export function assessPreviewEvidence(evidence) {
  const findings = [];
  const commit = evidence?.implementationCommit;
  if (!SHA.test(commit || '')) findings.push('An exact implementation commit is required.');
  const validation = evidence?.validation;
  if (validation?.testedCommit !== commit) findings.push('Validation is for a different implementation commit.');
  if (!https(validation?.runUrl, 'github.com')) findings.push('A GitHub validation run URL is required.');
  if (typeof evidence?.repository !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(evidence.repository)
    || validation?.repository !== evidence.repository) findings.push('Validation repository identity does not match.');
  if (evidence?.repository && (typeof validation?.runUrl !== 'string' || !validation.runUrl.startsWith('https://github.com/' + evidence.repository + '/actions/runs/'))) findings.push('Validation run belongs to another repository.');
  for (const name of ['dependencies', 'types', 'build', 'browserInstallation', 'browserTests']) {
    if (validation?.checks?.[name] !== 'success') findings.push('Required check is not successful: ' + name);
  }
  if (validation?.passed !== true) findings.push('Validation has not passed.');
  const preview = evidence?.preview;
  if (preview?.commit !== commit) findings.push('Preview is for a different implementation commit.');
  if (preview?.status !== 'READY' || preview?.inspected !== true || !https(preview?.url)) findings.push('The matching preview must be READY and actually inspected.');
  if (evidence?.assetsCommitted !== true) findings.push('Required design assets have not been committed.');
  return { readyForHumanReview: findings.length === 0, findings };
}

export function validateAcceptanceReport(report) {
  const findings = [];
  if (!object(report) || report.schemaVersion !== 1) findings.push('Acceptance report schemaVersion must be 1.');
  if (report?.status !== 'complete') findings.push('Real-user acceptance is still pending.');
  if (!SHA.test(report?.testedRevision || '')) findings.push('Acceptance must name the exact tested toolkit revision.');
  if (!Array.isArray(report?.sessions) || report.sessions.length < 2) findings.push('Two real personal-ChatGPT tester sessions are required.');
  const sessions = Array.isArray(report?.sessions) ? report.sessions : [];
  const personas = new Set();
  const styles = new Set();
  const testers = new Set();
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
    if (session.previewEvidence?.repository && (typeof session.pullRequestUrl !== 'string' || !session.pullRequestUrl.startsWith('https://github.com/' + session.previewEvidence.repository + '/pull/'))) findings.push(prefix + 'pull request repository does not match the preview evidence.');
    if (session.usedWork !== false || session.usedCodex !== false || session.usedLocalTerminal !== false) findings.push(prefix + 'must complete without Work, Codex, or a local terminal.');
    if (session.result !== 'passed' || session.humanVisualAcceptance !== true) findings.push(prefix + 'human visual acceptance and a passing result are required.');
    for (const name of ['setupSteps', 'clarificationCount', 'timeToFirstPreviewSeconds']) {
      if (!Number.isFinite(session[name]) || (name !== 'timeToFirstPreviewSeconds' && !Number.isInteger(session[name])) || session[name] < 0 || (name === 'timeToFirstPreviewSeconds' && session[name] === 0)) findings.push(prefix + name + ' must be recorded.');
    }
    for (const result of [assessCapabilities(session.capabilityEvidence), assessPreviewEvidence(session.previewEvidence)]) {
      findings.push(...result.findings.map(finding => prefix + finding));
    }
    if (session.resumedInNewChat !== true || session.correctionVerified !== true) findings.push(prefix + 'new-chat resume and a verified correction must be exercised.');
  }
  if (testers.size < 2) findings.push('Acceptance requires two distinct real testers.');
  if (personas.size < 2) findings.push('Both personas must be represented.');
  if (styles.size < 2) findings.push('Both review styles must be exercised.');
  return { ready: findings.length === 0, findings };
}
