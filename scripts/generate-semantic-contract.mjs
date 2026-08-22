#!/usr/bin/env node

import {
  existsSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'workflow', 'semantic-contract.json');
const projectionPath = join(root, 'workflow', 'Semantic-Contract.md');

export function loadSemanticContract(path = sourcePath) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function repositoryPathExists(repositoryPath, rootDir) {
  return typeof repositoryPath === 'string'
    && repositoryPath.length > 0
    && existsSync(join(rootDir, repositoryPath));
}

export function semanticContractFindings(contract, { rootDir = root } = {}) {
  const findings = [];
  const push = (message) => findings.push(message);

  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    return ['semantic contract must be a JSON object'];
  }
  if (!Number.isInteger(contract.contractVersion) || contract.contractVersion < 1) {
    push('contractVersion must be a positive integer');
  }

  const authority = contract.authority ?? {};
  if (authority.machineReadable !== 'workflow/semantic-contract.json') {
    push('authority.machineReadable must identify workflow/semantic-contract.json');
  }
  if (authority.humanProjection !== 'workflow/Semantic-Contract.md') {
    push('authority.humanProjection must identify workflow/Semantic-Contract.md');
  }
  if (authority.projectionGenerated !== true) {
    push('authority.projectionGenerated must be true');
  }

  const entrypoints = Array.isArray(contract.entrypoints) ? contract.entrypoints : [];
  if (entrypoints.length === 0) push('entrypoints must contain at least one entry');
  for (const id of duplicates(entrypoints.map((entry) => entry?.id))) push(`duplicate entrypoint id: ${id}`);
  for (const path of duplicates(entrypoints.map((entry) => entry?.path))) push(`duplicate entrypoint path: ${path}`);
  for (const entry of entrypoints) {
    if (typeof entry?.id !== 'string' || !entry.id) push('every entrypoint requires a non-empty id');
    if (!repositoryPathExists(entry?.path, rootDir)) push(`entrypoint path does not exist: ${entry?.path ?? '<missing>'}`);
    if (typeof entry?.role !== 'string' || !entry.role) push(`entrypoint ${entry?.id ?? '<missing>'} requires a role`);
    if (!Array.isArray(entry?.owns) || entry.owns.length === 0) push(`entrypoint ${entry?.id ?? '<missing>'} requires at least one owned responsibility`);
    if (!Array.isArray(entry?.delegatesTo)) push(`entrypoint ${entry?.id ?? '<missing>'} delegatesTo must be an array`);
    for (const target of entry?.delegatesTo ?? []) {
      if (!repositoryPathExists(target, rootDir)) push(`entrypoint ${entry.id} delegates to missing path: ${target}`);
    }
  }

  const domains = Array.isArray(contract.domains) ? contract.domains : [];
  if (domains.length === 0) push('domains must contain at least one canonical owner');
  for (const id of duplicates(domains.map((domain) => domain?.id))) push(`duplicate domain id: ${id}`);
  for (const domain of domains) {
    if (typeof domain?.id !== 'string' || !domain.id) push('every domain requires a non-empty id');
    if (!repositoryPathExists(domain?.owner, rootDir)) push(`domain owner does not exist: ${domain?.owner ?? '<missing>'}`);
  }

  const controlModes = Array.isArray(contract.controlModes) ? contract.controlModes : [];
  if (controlModes.length === 0) push('controlModes must contain at least one mode');
  for (const id of duplicates(controlModes.map((mode) => mode?.id))) push(`duplicate control mode id: ${id}`);
  for (const mode of controlModes) {
    if (typeof mode?.id !== 'string' || !mode.id) push('every control mode requires a non-empty id');
    if (typeof mode?.executable !== 'boolean') push(`control mode ${mode?.id ?? '<missing>'} requires executable boolean`);
    if (typeof mode?.canonicalState !== 'string' || !mode.canonicalState) push(`control mode ${mode?.id ?? '<missing>'} requires canonicalState`);
    if (mode?.generatedProjectionRoot !== null && typeof mode?.generatedProjectionRoot !== 'string') {
      push(`control mode ${mode?.id ?? '<missing>'} generatedProjectionRoot must be a string or null`);
    }
  }

  if (!Number.isInteger(contract.architecture?.stage) || contract.architecture.stage < 0) {
    push('architecture.stage must be a non-negative integer');
  }
  if (typeof contract.architecture?.decisionRequired !== 'boolean') {
    push('architecture.decisionRequired must be boolean');
  }
  if (!contract.architecture?.profiles || typeof contract.architecture.profiles !== 'object' || Array.isArray(contract.architecture.profiles)) {
    push('architecture.profiles must be an object');
  }

  const compatibility = contract.compatibility ?? {};
  if (!repositoryPathExists(compatibility.owner, rootDir)) push(`compatibility owner does not exist: ${compatibility.owner ?? '<missing>'}`);
  if (!repositoryPathExists(compatibility.humanProjection, rootDir)) push(`compatibility projection does not exist: ${compatibility.humanProjection ?? '<missing>'}`);
  if (!Array.isArray(compatibility.contracts) || compatibility.contracts.length === 0) {
    push('compatibility.contracts must contain at least one contract id');
  } else {
    for (const id of duplicates(compatibility.contracts)) push(`duplicate compatibility contract id: ${id}`);
    for (const id of compatibility.contracts) {
      if (typeof id !== 'string' || !id) push('every compatibility contract id must be a non-empty string');
    }
  }

  return findings;
}

function markdownLink(repositoryPath) {
  const relativePath = repositoryPath.startsWith('workflow/')
    ? repositoryPath.slice('workflow/'.length)
    : `../${repositoryPath}`;
  return `[\`${repositoryPath}\`](${relativePath})`;
}

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function listCell(values) {
  return values.length > 0 ? values.map((value) => `\`${cell(value)}\``).join('<br>') : '—';
}

export function renderSemanticContractMarkdown(contract) {
  const lines = [
    '# Cross-document Semantic Contract',
    '',
    '> Generated from `workflow/semantic-contract.json`. Do not edit this file manually.',
    '',
    'This projection makes cross-document ownership and executable compatibility visible to humans while the JSON registry remains the canonical machine-readable contract.',
    '',
    '## Entrypoint responsibilities',
    '',
    '| ID | Path | Role | Owns | Delegates to |',
    '|---|---|---|---|---|',
  ];

  for (const entry of contract.entrypoints) {
    lines.push(`| \`${cell(entry.id)}\` | ${markdownLink(entry.path)} | ${cell(entry.role)} | ${listCell(entry.owns)} | ${entry.delegatesTo.length > 0 ? entry.delegatesTo.map(markdownLink).join('<br>') : '—'} |`);
  }

  lines.push('', '## Canonical domains', '', '| Domain | Canonical owner |', '|---|---|');
  for (const domain of contract.domains) lines.push(`| \`${cell(domain.id)}\` | ${markdownLink(domain.owner)} |`);

  lines.push('', '## Control modes', '', '| Mode | Executable control plane | Canonical mutable state | Generated projections |', '|---|---:|---|---|');
  for (const mode of contract.controlModes) {
    lines.push(`| \`${cell(mode.id)}\` | ${mode.executable ? 'Yes' : 'No'} | \`${cell(mode.canonicalState)}\` | ${mode.generatedProjectionRoot ? `\`${cell(mode.generatedProjectionRoot)}\`` : 'None'} |`);
  }

  lines.push('', '## Architecture rules', '', `Stage ${contract.architecture.stage} requires an explicit architecture decision: **${contract.architecture.decisionRequired ? 'yes' : 'no'}**.`, '', '| Profile | If architecture is required | Architecture artifact policy |', '|---|---|---|');
  for (const [profile, rule] of Object.entries(contract.architecture.profiles)) {
    lines.push(`| ${cell(profile)} | \`${cell(rule.requiredDecisionOutcome)}\` | \`${cell(rule.artifactPolicy)}\` |`);
  }

  lines.push(
    '',
    '## Compatibility contract coverage',
    '',
    `Version numbers and compatibility rules are owned by ${markdownLink(contract.compatibility.owner)} and projected in ${markdownLink(contract.compatibility.humanProjection)}. This semantic contract only records which compatibility contracts must remain represented across the documentation architecture.`,
    '',
  );
  for (const id of contract.compatibility.contracts) lines.push(`- \`${cell(id)}\``);

  lines.push('', '## Maintenance rule', '', 'Change the JSON registry first. Regenerate this projection, then run the semantic-contract behavioral test and the full repository validation suite. Cross-document prose may explain these relationships, but it must not become an independent source of truth for the relationships listed here.', '');
  return lines.join('\n');
}

export function generateSemanticContract({ check = false } = {}) {
  const contract = loadSemanticContract();
  const findings = semanticContractFindings(contract);
  if (findings.length > 0) throw new Error(`Semantic contract is invalid:\n${findings.map((finding) => `- ${finding}`).join('\n')}`);

  const rendered = renderSemanticContractMarkdown(contract);
  if (check) {
    if (!existsSync(projectionPath)) throw new Error('workflow/Semantic-Contract.md is missing; regenerate it.');
    const current = readFileSync(projectionPath, 'utf8');
    if (current !== rendered) throw new Error('workflow/Semantic-Contract.md is stale; regenerate it.');
    return { current: true, rendered };
  }

  writeFileSync(projectionPath, rendered);
  return { current: true, rendered };
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) {
  try {
    const check = process.argv.slice(2).includes('--check');
    generateSemanticContract({ check });
    console.log(check ? 'Semantic contract projection is current.' : 'Generated workflow/Semantic-Contract.md.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
