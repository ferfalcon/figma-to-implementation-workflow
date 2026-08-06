import {
  commandHelp, commandInit, commandMode, commandNext, commandStage,
  commandStatus, commandSync, commandTrace, commandValidate,
} from './commands-project.mjs';
import { commandArtifact, commandSnapshot } from './commands-resources.mjs';
import { commandTask } from './commands-tasks.mjs';
import { fail, parseArgs } from './utils.mjs';

export async function runCli(args, environment) {
  const { cwd, stdout, stderr } = environment;
  const { positionals, options } = parseArgs(args);
  const command = positionals[0];
  if (!command || command === 'help' || options.help) { commandHelp(stdout); return 0; }
  if (command === 'init') return commandInit(cwd, stdout, stderr, options);
  if (command === 'status') return commandStatus(cwd, stdout, stderr, options);
  if (command === 'next') return commandNext(cwd, stdout, stderr, options);
  if (command === 'stage') return commandStage(cwd, stdout, stderr, positionals, options);
  if (command === 'mode') return commandMode(cwd, stdout, stderr, positionals, options);
  if (command === 'snapshot') return commandSnapshot(cwd, stdout, stderr, positionals, options);
  if (command === 'artifact') return commandArtifact(cwd, stdout, stderr, positionals, options);
  if (command === 'task') return commandTask(cwd, stdout, stderr, positionals, options);
  if (command === 'sync') return commandSync(cwd, stdout, stderr, options);
  if (command === 'validate') return commandValidate(cwd, stdout, stderr, options);
  if (command === 'trace') return commandTrace(cwd, stdout, stderr, positionals[1], options);
  return fail(stderr, `Unknown command: ${command}. Run "design-workflow help".`);
}
