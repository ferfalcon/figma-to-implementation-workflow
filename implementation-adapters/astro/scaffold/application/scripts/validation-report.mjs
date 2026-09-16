import { writeFileSync } from 'node:fs';

const checks = Object.fromEntries([
  ['dependencies', 'DEPENDENCIES'],
  ['types', 'TYPECHECK'],
  ['build', 'BUILD'],
  ['browserInstallation', 'BROWSERS'],
  ['browserTests', 'TESTS'],
].map(([name, variable]) => [name, process.env[variable] || 'not-run']));

const commit = process.env.TESTED_COMMIT || '';
const report = {
  schemaVersion: 1,
  repository: process.env.GITHUB_REPOSITORY || '',
  testedCommit: commit,
  runUrl: 'https://github.com/' + process.env.GITHUB_REPOSITORY + '/actions/runs/' + process.env.GITHUB_RUN_ID,
  checks,
  passed: /^[0-9a-f]{40}$/i.test(commit) && Object.values(checks).every(value => value === 'success'),
};
writeFileSync('validation-result.json', JSON.stringify(report, null, 2) + '\n');
console.log('VALIDATION_RESULT=' + JSON.stringify(report));
if (!report.passed) process.exitCode = 1;
