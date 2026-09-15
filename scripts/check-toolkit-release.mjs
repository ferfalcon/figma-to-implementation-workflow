#!/usr/bin/env node

import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unreleasedBody(changelog) {
  const marker = '## [Unreleased]';
  const start = changelog.indexOf(marker);
  if (start === -1) return null;

  const bodyStart = start + marker.length;
  const rest = changelog.slice(bodyStart);
  const nextHeading = rest.search(/^## \[[^\]]+\]/m);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function inspectToolkitRelease({ requestedVersion, packageMetadata, changelog }) {
  const findings = [];
  const packageVersion = packageMetadata?.version;

  if (typeof packageVersion !== 'string' || packageVersion.length === 0) {
    findings.push('package.json must contain a non-empty version string.');
  } else if (!/^\d+\.\d+\.\d+$/.test(packageVersion)) {
    findings.push(`package.json version ${packageVersion} is not a stable MAJOR.MINOR.PATCH version.`);
  }

  if (typeof requestedVersion !== 'string' || requestedVersion.length === 0) {
    findings.push('A release version must be supplied explicitly.');
  } else if (typeof packageVersion === 'string' && requestedVersion !== packageVersion) {
    findings.push(`Requested version ${requestedVersion} does not match package.json version ${packageVersion}.`);
  }

  if (typeof packageVersion === 'string' && packageVersion.length > 0) {
    const releaseHeading = new RegExp(`^## \\[${escapeRegExp(packageVersion)}\\] — \\d{4}-\\d{2}-\\d{2}\\s*$`, 'm');
    if (!releaseHeading.test(changelog)) {
      findings.push(`CHANGELOG.md does not contain a dated release heading for ${packageVersion}.`);
    }
  }

  const pending = unreleasedBody(changelog);
  if (pending === null) {
    findings.push('CHANGELOG.md is missing the ## [Unreleased] section.');
  } else if (pending.length > 0) {
    findings.push('CHANGELOG.md [Unreleased] must be empty before creating a stable toolkit release.');
  }

  const version = typeof packageVersion === 'string' && packageVersion.length > 0 ? packageVersion : null;
  return {
    ready: findings.length === 0,
    version,
    tag: version ? `v${version}` : null,
    findings,
  };
}

function parseArguments(argv) {
  const options = { requestedVersion: null, githubOutput: null };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

    if (argument === '--version') {
      options.requestedVersion = value ?? null;
      index += 1;
      continue;
    }

    if (argument === '--github-output') {
      options.githubOutput = value ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const packageMetadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  const result = inspectToolkitRelease({
    requestedVersion: options.requestedVersion,
    packageMetadata,
    changelog,
  });

  if (!result.ready) {
    console.error('Toolkit release preflight failed:');
    for (const finding of result.findings) console.error(`- ${finding}`);
    process.exitCode = 1;
    return;
  }

  if (options.githubOutput) {
    appendFileSync(options.githubOutput, `version=${result.version}\ntag=${result.tag}\n`);
  }

  console.log(`Toolkit release preflight passed for ${result.tag}.`);
}

const directInvocation = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (directInvocation) main();
