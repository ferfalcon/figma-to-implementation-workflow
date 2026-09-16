import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { adapterEntry } from './adapter-catalog.mjs';
import { PROJECT_CONFIGURATION_SCHEMA_VERSION } from './contract-compatibility.mjs';

export const PROJECT_CONFIGURATION_VERSION = PROJECT_CONFIGURATION_SCHEMA_VERSION;
export const REVIEW_STYLES = Object.freeze(['brief-and-final', 'every-stage']);
export const LEGACY_REVIEW_STYLES = Object.freeze(['brief-and-preview', 'every-stage']);

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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!object(value)) return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

function reviewStyleForSession(config) {
  if (config.schemaVersion === 3) return config.workflow.reviewStyle;
  if (config.schemaVersion === 2) {
    return config.workflow.reviewStyle === 'brief-and-preview' ? 'brief-and-final' : config.workflow.reviewStyle;
  }
  return null;
}

export function projectConfigurationRevision(config) {
  const report = validateProjectConfiguration(config);
  if (!report.valid) throw new Error(report.findings.join('\n'));
  const canonical = JSON.stringify(canonicalize(config));
  return {
    algorithm: 'sha256',
    digest: createHash('sha256').update(canonical, 'utf8').digest('hex'),
  };
}

export function validWorkingBranch(value) {
  return text(value) && value.length <= 200
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value)
    && value !== 'HEAD' && !/^[0-9a-f]{40}$/i.test(value) && !value.startsWith('refs/')
    && !value.includes('..') && !value.includes('//')
    && !value.endsWith('/') && !value.endsWith('.')
    && value.split('/').every((part) => !part.startsWith('.') && !part.endsWith('.lock'));
}

function validateLegacyDeployment(config, findings) {
  if (!fields(config.deployment, ['vercelProjectUrl', 'productionUrl'], 'deployment', findings)) return;
  for (const name of ['vercelProjectUrl', 'productionUrl']) {
    const value = config.deployment[name];
    if (value === null) continue;
    let legacyUri = false;
    try { legacyUri = config.schemaVersion === 1 && text(value) && Boolean(new URL(value).protocol); } catch { /* Invalid URI. */ }
    if (!legacyUri && !https(value)) findings.push('deployment.' + name + ' must be ' + (config.schemaVersion === 1 ? 'a URI' : 'an HTTPS URL') + ' or null.');
  }
}

function validateCurrentDeployment(config, findings) {
  if (!fields(config.deployment, ['provider', 'projectUrl', 'productionUrl'], 'deployment', findings)) return;
  const { provider, projectUrl, productionUrl } = config.deployment;
  if (provider !== null) {
    if (typeof provider !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provider)) {
      findings.push('deployment.provider must be a lowercase adapter id or null.');
    } else if (!adapterEntry('deployment', provider)) {
      findings.push(`deployment.provider must identify a registered deployment adapter; received ${provider}.`);
    }
  }
  for (const [name, value] of [['projectUrl', projectUrl], ['productionUrl', productionUrl]]) {
    if (value !== null && !https(value)) findings.push(`deployment.${name} must be an HTTPS URL or null.`);
  }
  if ((provider === null) !== (projectUrl === null)) {
    findings.push('deployment.provider and deployment.projectUrl must either both be configured or both be null.');
  }
}

export function validateProjectConfiguration(config) {
  const findings = [];
  if (!object(config)) return { valid: false, findings: ['Configuration must be an object.'] };
  const version = config.schemaVersion;
  if (![1, 2, 3].includes(version)) findings.push('schemaVersion must be 1, 2, or 3.');
  const hasWorkflow = version === 2 || version === 3;
  fields(config, ['schemaVersion', 'project', 'repository', 'design', 'deployment', ...(hasWorkflow ? ['workflow'] : [])], 'config', findings);
  if (fields(config.project, ['name'], 'project', findings) && !text(config.project.name)) findings.push('project.name must be a non-empty resolved name.');
  const repositoryFields = ['url', 'implementationRoot', ...(hasWorkflow ? ['workingBranch'] : [])];
  if (fields(config.repository, repositoryFields, 'repository', findings)) {
    const repository = config.repository;
    if (!https(repository.url, ['github.com']) || !/^https:\/\/github\.com\/[^/?#]+\/[^/?#]+\/?$/.test(repository.url)) findings.push('repository.url must identify one GitHub repository over HTTPS.');
    if (!text(repository.implementationRoot) || /^(?:\/|[A-Za-z]:)|\\/.test(repository.implementationRoot)
      || repository.implementationRoot.split('/').includes('..')) findings.push('repository.implementationRoot must remain inside the repository.');
    if (hasWorkflow && !validWorkingBranch(repository.workingBranch)) findings.push('repository.workingBranch must be a valid branch name, not a ref, SHA locator, or path escape.');
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
  if (version === 3) validateCurrentDeployment(config, findings);
  else validateLegacyDeployment(config, findings);

  if (hasWorkflow && fields(config.workflow, ['reviewStyle'], 'workflow', findings)) {
    const styles = version === 3 ? REVIEW_STYLES : LEGACY_REVIEW_STYLES;
    if (!styles.includes(config.workflow.reviewStyle)) {
      findings.push(`Choose workflow.reviewStyle: ${styles.join(' or ')}.`);
    }
  }
  return { valid: findings.length === 0, findings };
}

export function readProjectConfiguration(projectRoot) {
  const config = JSON.parse(readFileSync(join(projectRoot, 'design-workflow.config.json'), 'utf8'));
  const report = validateProjectConfiguration(config);
  if (!report.valid) throw new Error(report.findings.join('\n'));
  return config;
}

export function migrateProjectConfiguration(config, {
  targetVersion = PROJECT_CONFIGURATION_VERSION,
  workingBranch = null,
  reviewStyle = null,
} = {}) {
  const sourceReport = validateProjectConfiguration(config);
  if (!sourceReport.valid) throw new Error(sourceReport.findings.join('\n'));
  if (targetVersion !== PROJECT_CONFIGURATION_VERSION) {
    throw new Error(`Only migration to project configuration v${PROJECT_CONFIGURATION_VERSION} is supported.`);
  }
  if (config.schemaVersion === PROJECT_CONFIGURATION_VERSION) {
    return {
      changed: false,
      fromVersion: config.schemaVersion,
      toVersion: PROJECT_CONFIGURATION_VERSION,
      config: structuredClone(config),
    };
  }

  const fromVersion = config.schemaVersion;
  if (fromVersion === 1) {
    if (!validWorkingBranch(workingBranch)) {
      throw new Error('Configuration v1 migration requires --working-branch with the established working branch.');
    }
    if (!REVIEW_STYLES.includes(reviewStyle)) {
      throw new Error('Configuration v1 migration requires --review-style brief-and-final or every-stage.');
    }
  }

  const legacyProjectUrl = config.deployment.vercelProjectUrl;
  const candidate = {
    schemaVersion: PROJECT_CONFIGURATION_VERSION,
    project: structuredClone(config.project),
    repository: {
      ...structuredClone(config.repository),
      workingBranch: fromVersion === 1 ? workingBranch : config.repository.workingBranch,
    },
    design: structuredClone(config.design),
    deployment: {
      provider: legacyProjectUrl === null ? null : 'vercel',
      projectUrl: legacyProjectUrl,
      productionUrl: config.deployment.productionUrl,
    },
    workflow: {
      reviewStyle: fromVersion === 1
        ? reviewStyle
        : (config.workflow.reviewStyle === 'brief-and-preview' ? 'brief-and-final' : 'every-stage'),
    },
  };

  const candidateReport = validateProjectConfiguration(candidate);
  if (!candidateReport.valid) {
    throw new Error(`Configuration v${fromVersion} cannot migrate automatically to v${PROJECT_CONFIGURATION_VERSION}:\n${candidateReport.findings.join('\n')}`);
  }
  return {
    changed: true,
    fromVersion,
    toVersion: PROJECT_CONFIGURATION_VERSION,
    config: candidate,
  };
}

function repositoryIdentity(value) {
  return value.replace(/\/$/, '').replace(/\.git$/, '').toLowerCase();
}

// Resolves stable settings only. Stage/task legality and approval evidence remain CLI-owned.
export function resolveProjectSession(config, {
  repositoryUrl = config.repository?.url,
  defaultBranch = null,
  currentRef = null,
  currentMode = null,
} = {}) {
  const report = validateProjectConfiguration(config);
  if (!report.valid) throw new Error(report.findings.join('\n'));
  if (typeof repositoryUrl !== 'string' || repositoryIdentity(repositoryUrl) !== repositoryIdentity(config.repository.url)) {
    throw new Error('Repository identity mismatch; do not switch repositories.');
  }
  const reviewStyle = reviewStyleForSession(config);
  const workingBranch = config.schemaVersion >= 2 ? config.repository.workingBranch : currentRef || defaultBranch;
  if (config.schemaVersion >= 2 && currentRef && currentRef !== workingBranch) {
    throw new Error('The explicit working ref differs from repository.workingBranch; resolve the conflict before work.');
  }
  return {
    schemaVersion: config.schemaVersion,
    configurationRevision: projectConfigurationRevision(config),
    workingBranch,
    reviewStyle,
    initialMode: currentMode || (reviewStyle === 'brief-and-final' ? 'Continuous documentation' : 'Gated'),
    requiresMigration: config.schemaVersion === 2,
    requiresAdoption: config.schemaVersion === 1,
  };
}
