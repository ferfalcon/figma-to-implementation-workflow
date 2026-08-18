#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bindRepositoryWorkspace,
  canonicalRemoteReference,
  canonicalRepositoryReference,
  captureRepositorySnapshot,
  isPortableRepositoryReference,
  resolveRepositoryWorkspace,
  sameRepositoryReference,
} from '../cli/lib/repository-binding.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'cli', 'design-workflow.mjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectThrow(action, fragment, message) {
  try {
    action();
  } catch (error) {
    assert(error instanceof Error && error.message.includes(fragment), `${message}: unexpected error ${error}`);
    return;
  }
  throw new Error(`${message}: expected an error containing "${fragment}".`);
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Git command failed: git ${args.join(' ')}\n${result.stderr}`);
  return result.stdout.trim();
}

function runCli(cwd, args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, TMPDIR: '/tmp' },
  });
  if (result.status !== expectedStatus) {
    throw new Error([
      `Command failed: design-workflow ${args.join(' ')}`,
      `Expected ${expectedStatus}, received ${result.status}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return result;
}

function initializeRepository(path, content = 'baseline\n') {
  mkdirSync(path, { recursive: true });
  git(path, ['init']);
  git(path, ['config', 'user.email', 'fixture@example.com']);
  git(path, ['config', 'user.name', 'Fixture']);
  writeFileSync(join(path, 'seed.txt'), content, 'utf8');
  git(path, ['add', 'seed.txt']);
  git(path, ['commit', '-m', 'Create baseline']);
  return git(path, ['rev-parse', 'HEAD']);
}

const workspace = mkdtempSync(join(tmpdir(), 'design-workflow-binding-'));
const project = join(workspace, 'project');
const recordPath = join(project, '.workflow', 'workflow-record.json');

try {
  const commit = initializeRepository(project);
  mkdirSync(join(project, '.workflow'), { recursive: true });

  assert(
    canonicalRemoteReference('git@github.com:Example/Design-Project.git') === 'https://github.com/Example/Design-Project',
    'SCP-style SSH remote did not canonicalize to a credential-free HTTPS identity.',
  );
  assert(
    canonicalRemoteReference('https://token@example.com/Org/Repo.git') === 'https://example.com/Org/Repo',
    'Credential-bearing HTTPS remote did not strip credentials.',
  );
  assert(
    sameRepositoryReference('ssh://git@github.com/Example/Repo.git', 'https://github.com/Example/Repo'),
    'Equivalent SSH and HTTPS repository identities did not compare equal.',
  );

  const projectCapture = captureRepositorySnapshot(project, '.', { cwd: project });
  assert(projectCapture.commit === commit, 'Project repository capture did not pin HEAD.');
  assert(projectCapture.reference === 'project://.', 'Repository inside the workflow project did not use project:// identity.');
  assert(
    canonicalRepositoryReference(project, project) === 'project://.',
    'Canonical repository identity did not use project:// before a remote existed.',
  );
  assert(isPortableRepositoryReference(project, 'project://.'), 'Valid project:// identity was not recognized as portable.');
  assert(!isPortableRepositoryReference(project, 'project://../escape'), 'Escaping project:// identity was accepted.');

  const remote = 'git@github.com:example/design-project.git';
  git(project, ['remote', 'add', 'origin', remote]);
  const remoteCapture = captureRepositorySnapshot(project, '.', { cwd: project });
  assert(
    remoteCapture.reference === 'https://github.com/example/design-project',
    'Repository capture did not prefer the credential-free canonical remote identity.',
  );

  const remoteSnapshot = {
    id: 'SRC-REPO-001', reference: remoteCapture.reference, commit,
  };
  const remoteBinding = resolveRepositoryWorkspace(recordPath, remoteSnapshot, { cwd: project });
  assert(remoteBinding.repository === project, 'Remote repository identity did not bind to the current checkout.');
  assert(remoteBinding.reference === remoteCapture.reference, 'Resolved binding changed the canonical remote identity.');

  const external = join(workspace, 'external-checkout');
  git(workspace, ['clone', project, external]);
  const localBinding = bindRepositoryWorkspace(recordPath, remoteSnapshot, external, { cwd: project });
  assert(localBinding.repository === external, 'External checkout was not accepted as a machine-local binding.');
  const localBindingFile = join(project, '.workflow', 'local.json');
  assert(existsSync(localBindingFile), 'Machine-local repository binding file was not created.');
  const localBindings = JSON.parse(readFileSync(localBindingFile, 'utf8'));
  assert(
    localBindings.repositories[remoteSnapshot.reference] === external,
    'External local checkout was not stored under the canonical repository identity.',
  );

  const rebound = resolveRepositoryWorkspace(recordPath, remoteSnapshot, { cwd: join(workspace, 'unrelated') });
  assert(rebound.repository === external, 'Stored machine-local binding was not used to resolve the external checkout.');

  const conflicting = join(workspace, 'conflicting-checkout');
  git(workspace, ['clone', project, conflicting]);
  git(conflicting, ['remote', 'set-url', 'origin', 'https://github.com/other/project.git']);
  expectThrow(
    () => bindRepositoryWorkspace(recordPath, remoteSnapshot, conflicting, { cwd: project }),
    'identity does not match',
    'Conflicting repository remote identity was accepted',
  );

  const outsideNoRemote = join(workspace, 'outside-no-remote');
  initializeRepository(outsideNoRemote, 'external baseline\n');
  expectThrow(
    () => captureRepositorySnapshot(project, outsideNoRemote, { cwd: project }),
    'outside the workflow project and has no portable remote identity',
    'New external repository without a remote was allowed to persist a machine-specific path',
  );

  const legacySnapshot = {
    id: 'SRC-REPO-002', reference: '/old-machine/missing/project', commit,
  };
  const legacyBinding = resolveRepositoryWorkspace(recordPath, legacySnapshot, { cwd: project });
  assert(legacyBinding.repository === project, 'Legacy absolute-path snapshot could not rebind by commit identity.');
  assert(
    legacyBinding.reference === remoteCapture.reference,
    'Legacy absolute-path snapshot did not heal to the current portable repository identity at runtime.',
  );

  runCli(project, ['init', '--name', 'Portable CLI fixture', '--profile', 'Express', '--repository', '.']);
  const initialized = JSON.parse(readFileSync(recordPath, 'utf8'));
  const initializedRepository = initialized.snapshots.find((snapshot) => snapshot.id === 'SRC-REPO-001');
  assert(
    initializedRepository?.reference === remoteCapture.reference,
    'Public CLI initialization did not persist the canonical portable repository identity.',
  );
  assert(
    !initializedRepository.reference.includes(workspace),
    'Public CLI initialization persisted a machine-specific checkout path.',
  );
  runCli(project, ['repository', 'bind', 'SRC-REPO-001', '--path', external]);
  assert(existsSync(localBindingFile), 'Public repository bind command did not create the local binding file.');

  const externalWorkflow = join(workspace, 'external-workflow');
  mkdirSync(externalWorkflow, { recursive: true });
  const rejected = runCli(
    externalWorkflow,
    ['init', '--name', 'Rejected external fixture', '--profile', 'Express', '--repository', outsideNoRemote],
    1,
  );
  assert(
    rejected.stderr.includes('outside the workflow project and has no portable remote identity'),
    'CLI did not explain why an external no-remote repository is non-portable.',
  );
  assert(
    !existsSync(join(externalWorkflow, '.workflow', 'workflow-record.json')),
    'Rejected non-portable initialization created partial workflow state.',
  );

  console.log('Portable repository identity, local binding, public CLI, containment, and legacy compatibility tests passed.');
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
