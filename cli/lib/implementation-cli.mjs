import { adapterEntry } from './adapter-catalog.mjs';
import { materializeAstroScaffold } from './implementation-scaffold.mjs';
import { currentTaskForRecord, implementationAllowed } from './orchestration-routing.mjs';
import { readProjectConfiguration } from './project-configuration.mjs';
import { readStoredRecord } from './record-store.mjs';
import { fail, write } from './utils.mjs';
import { workflowDiagnostics } from './workflow-diagnostics.mjs';

function json(stdout, value) {
  write(stdout, JSON.stringify(value, null, 2));
}

export function runImplementationCli({ positionals, options, projectRoot, recordPath, stdout, stderr }) {
  if (positionals[1] !== 'scaffold' || !positionals[2] || positionals.length !== 3) {
    return fail(stderr, 'Usage: design-workflow implementation scaffold <adapter-id> [--json]');
  }
  const unsupportedOptions = Object.keys(options).filter((name) => name !== 'json' && name !== 'record');
  if (unsupportedOptions.length > 0) {
    return fail(stderr, `Unsupported implementation scaffold options: ${unsupportedOptions.map((name) => `--${name}`).join(', ')}`);
  }

  const adapterId = positionals[2];
  try {
    const adapter = adapterEntry('implementation', adapterId);
    if (!adapter) throw new Error(`Unknown implementation adapter: ${adapterId}.`);
    if (!adapter.modes.includes('scaffold') || !adapter.scaffoldResource) {
      throw new Error(`Implementation adapter ${adapterId} does not provide a maintained scaffold capability.`);
    }

    const config = readProjectConfiguration(projectRoot);
    const { record } = readStoredRecord(recordPath);
    const diagnostics = workflowDiagnostics(recordPath, record);
    const currentTask = currentTaskForRecord(record);
    if (!implementationAllowed(record, { workflowValid: diagnostics.valid, currentTask })) {
      throw new Error('Implementation scaffolding requires a valid schema-v2 workflow at Stage 10 with an in-progress current task and a non-Continuous-documentation execution mode.');
    }

    const result = materializeAstroScaffold({
      projectRoot,
      implementationRoot: config.repository.implementationRoot,
    });
    const payload = {
      ...result,
      task: currentTask.id,
      support: adapter.support,
    };
    if (options.json) json(stdout, payload);
    else {
      write(stdout, `Materialized ${adapterId} at ${result.implementationRoot} for ${currentTask.id}.`);
      write(stdout, `Created ${result.created.length} files; preserved ${result.preserved.length}; unchanged ${result.unchanged.length}.`);
      write(stdout, `Repository validation workflow: ${result.workflow}`);
    }
    return 0;
  } catch (error) {
    return fail(stderr, error instanceof Error ? error.message : String(error));
  }
}
