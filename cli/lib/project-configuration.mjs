import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PROJECT_CONFIGURATION_VERSION = 2;
export const REVIEW_STYLES = ['brief-and-preview', 'every-stage'];

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function fields(value, names, path, findings) {
  if (!object(value)) {
    findings.push(path + ' must be an object.');
    return false;
  }
  for (const name of Object.keys(value)) {
    if (!names.includes(name)) findings.push(path + '.' + name + ' is not supported.');
  }
  for (const name of names) {
    if (!(name in value)) findings.push(path + '.' + name + ' is required.');
  }
  return true;
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0 && !/[<>\u0000-\u001f]/.test(value);
}

function https(value, host) {
  if (!text(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      && (!host || host.includes(url.hostname)) && !url.hash && !url.search;
  } catch { return false; }
}

export function validWorkingBranch(value) {
  return text(value) && value.length <= 200
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value)
    && value !== 'HEAD' && !value.startsWith('refs/')
    && !value.includes('..') && !value.includes('//')
    && !value.endsWith('/') && !value.endsWith('.')
    && value.split('/').every((part) => !part.startsWith('.') && !part.endsWith('.lock'));
}

export function validateProjectConfiguration(config) {
  const findings = [];
  if (!object(config)) return { valid: false, findings: ['Configuration must be an object.'] };
  const version = config.schemaVersion;
  if (![1, 2].includes(version)) findings.push('schemaVersion must be 1 or 2.');
  fields(config, ['schemaVersion', 'project', 'repository', 'design', 'deployment', ...(version === 2 ? ['workflow'] : [])], 'config', findings);
  if (fields(config.project, ['name'], 'project', findings) && !text(config.project.name)) findings.push('project.name must be a non-empty resolved name.');
  const repositoryFields = ['url', 'implementationRoot', ...(version === 2 ? ['workingBranch'] : [])];
  if (fields(config.repository, repositoryFields, 'repository', findings)) {
    const repository = config.repository;
    if (!https(repository.url, ['github.com']) || !/^https:\/\/github\.com\/[^/?#]+\/[^/?#]+\/?$/.test(repository.url)) findings.push('repository.url must identify one GitHub repository over HTTPS.');
    if (!text(repository.implementationRoot) || /^(?:\/|[A-Za-z]:)|\\/.test(repository.implementationRoot)
      || repository.implementationRoot.split('/').includes('..')) findings.push('repository.implementationRoot must remain inside the repository.');
    if (version === 2 && !validWorkingBranch(repository.workingBranch)) findings.push('repository.workingBranch must be a valid branch name, not a ref, SHA locator, or path escape.');
  }
  if (fields(config.design, ['provider', 'url', 'scope'], 'design', findings)) {
    if (config.design.provider !== 'figma') findings.push('design.provider must be figma.');
    try {
      const url = new URL(config.design.url);
      if (url.protocol !== 'https:' || !['figma.com', 'www.figma.com'].includes(url.hostname)
        || url.username || url.password || !text(config.design.url)) throw new Error();
    } catch { findings.push('design.url must be a Figma HTTPS URL.'); }
    if (!text(config.design.scope)) findings.push('design.scope must name the selected design boundary.');
  }
  if (fields(config.deployment, ['vercelProjectUrl', 'productionUrl'], 'deployment', findings)) {
    for (const name of ['vercelProjectUrl', 'productionUrl']) {
      const value = config.deployment[name];
      if (value !== null && !https(value)) findings.push('deployment.' + name + ' must be an HTTPS URL or null.');
    }
  }
  if (version === 2 && fields(config.workflow, ['reviewStyle'], 'workflow', findings)
    && !REVIEW_STYLES.includes(config.workflow.reviewStyle)) findings.push('Choose workflow.reviewStyle: brief-and-preview or every-stage.');
  return { valid: findings.length === 0, findings };
}

export function readProjectConfiguration(projectRoot) {
  const config = JSON.parse(readFileSync(join(projectRoot, 'design-workflow.config.json'), 'utf8'));
  const report = validateProjectConfiguration(config);
  if (!report.valid) throw new Error(report.findings.join('\n'));
  return config;
}

function repositoryIdentity(value) {
  return value.replace(/\/$/, '').replace(/\.git$/, '').toLowerCase();
}

// Resolves stable settings only. Stage/task legality and approval evidence remain CLI-owned.
export function resolveProjectSession(config, {
  repositoryUrl = config.repository?.url,
  defaultBranch = 'main',
  currentRef = null,
  currentMode = null,
} = {}) {
  const report = validateProjectConfiguration(config);
  if (!report.valid) throw new Error(report.findings.join('\n'));
  if (typeof repositoryUrl !== 'string' || repositoryIdentity(repositoryUrl) !== repositoryIdentity(config.repository.url)) {
    throw new Error('Repository identity mismatch; do not switch repositories.');
  }
  const reviewStyle = config.schemaVersion === 2 ? config.workflow.reviewStyle : null;
  const workingBranch = config.schemaVersion === 2 ? config.repository.workingBranch : currentRef || defaultBranch;
  if (config.schemaVersion === 2 && currentRef && currentRef !== workingBranch) {
    throw new Error('The explicit working ref differs from repository.workingBranch; resolve the conflict before work.');
  }
  return {
    schemaVersion: config.schemaVersion,
    workingBranch,
    reviewStyle,
    initialMode: currentMode || (reviewStyle === 'brief-and-preview' ? 'Continuous documentation' : 'Gated'),
    requiresAdoption: config.schemaVersion === 1,
  };
}
