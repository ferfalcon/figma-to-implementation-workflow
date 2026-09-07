#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAcceptanceReport } from '../cli/lib/product-evidence.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function checkReleaseReadiness(report, revision, { cwd = root } = {}) {
  const result = validateAcceptanceReport(report);
  if (!result.ready) return result;
  if (!/^[0-9a-f]{40}$/i.test(revision || '')) return { ready: false, findings: ['An exact release revision is required.'] };
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', report.testedRevision, revision], { cwd, stdio: 'pipe' });
    const changed = execFileSync('git', ['diff', '--name-only', report.testedRevision, revision, '--', '.', ':!release/acceptance.json'], { cwd, encoding: 'utf8' }).trim();
    if (changed) return { ready: false, findings: ['Source changed after acceptance; retest this revision:\n' + changed] };
  } catch {
    return { ready: false, findings: ['The tested revision must exist in release history; fetch full history before checking.'] };
  }
  return { ready: true, findings: [] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    let reportPath = resolve(root, 'release/acceptance.json');
    let revision = null;
    for (let index = 0; index < args.length; index += 2) {
      if (args[index] === '--report' && args[index + 1]) reportPath = resolve(args[index + 1]);
      else if (args[index] === '--revision' && args[index + 1]) revision = args[index + 1];
      else throw new Error('Usage: check-release-readiness.mjs [--report path] [--revision exact-sha]');
    }
    revision ||= execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    const result = checkReleaseReadiness(report, revision);
    if (!result.ready) {
      console.error('Publication is blocked:\n- ' + result.findings.join('\n- '));
      process.exitCode = 1;
    } else {
      console.log('Recorded acceptance covers both personas and review styles on unchanged toolkit source.');
      console.log('This validates recorded evidence; it does not authenticate human attestations or replace provider inspection.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
