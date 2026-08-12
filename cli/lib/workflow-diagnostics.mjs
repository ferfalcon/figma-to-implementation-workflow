import { generatedStateFindings } from './generated-state.mjs';
import { validateWorkflowRecord } from '../../scripts/lib/validate-workflow-record.mjs';

export function workflowDiagnostics(recordPath, record) {
  const recordFindings = validateWorkflowRecord(record);
  const generatedFindings = generatedStateFindings(recordPath, record);
  return {
    recordValid: recordFindings.length === 0,
    generatedViewsCurrent: generatedFindings.length === 0,
    valid: recordFindings.length === 0 && generatedFindings.length === 0,
    recordFindings,
    generatedFindings,
    findings: [...recordFindings, ...generatedFindings],
  };
}
