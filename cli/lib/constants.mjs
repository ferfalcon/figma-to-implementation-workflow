export const PROFILES = ['Express', 'Lite', 'Standard', 'Full'];
export const MODES = ['Gated', 'Continuous documentation', 'Task-by-task'];
export const WORKFLOW_STATUSES = ['Not started', 'In progress', 'Ready', 'Blocked', 'Complete'];
export const ARTIFACT_STATUSES = ['Draft', 'Reviewed', 'Approved', 'Superseded'];

export const PROFILE_ARTIFACTS = {
  Express: ['WORKPACK'],
  Lite: [
    'SOURCE-BASELINE', 'PROJECT-CONTEXT', 'WORKFLOW-STATE',
    'DESIGN-AUDIT', 'IMPLEMENTATION-BRIEF', 'IMPLEMENTATION-REVIEW',
  ],
  Standard: [
    'SOURCE-BASELINE', 'PROJECT-CONTEXT', 'WORKFLOW-STATE', 'DESIGN-AUDIT',
    'REQUIREMENTS', 'DESIGN', 'SPEC', 'DOCUMENT-REVIEW', 'PLAN',
    'PLAN-REVIEW', 'TASKS-INDEX', 'IMPLEMENTATION-REVIEW',
  ],
  Full: [
    'SOURCE-BASELINE', 'PROJECT-CONTEXT', 'WORKFLOW-STATE', 'DESIGN-AUDIT',
    'REQUIREMENTS', 'DESIGN', 'SPEC', 'DOCUMENT-REVIEW', 'ARCHITECTURE',
    'PLAN', 'PLAN-REVIEW', 'TASKS-INDEX', 'IMPLEMENTATION-REVIEW',
  ],
};

export const ARTIFACT_FILES = {
  'SOURCE-BASELINE': ['SOURCE-BASELINE.md', 'SOURCE-BASELINE.template.md'],
  'PROJECT-CONTEXT': ['PROJECT-CONTEXT.md', 'PROJECT-CONTEXT.template.md'],
  'WORKFLOW-STATE': ['WORKFLOW-STATE.md', 'WORKFLOW-STATE.template.md'],
  'DESIGN-AUDIT': ['DESIGN-AUDIT.md', 'DESIGN-AUDIT.template.md'],
  WORKPACK: ['WORKPACK.md', 'WORKPACK.template.md'],
  'IMPLEMENTATION-BRIEF': ['IMPLEMENTATION-BRIEF.md', 'IMPLEMENTATION-BRIEF.template.md'],
  REQUIREMENTS: ['REQUIREMENTS.md', 'REQUIREMENTS.template.md'],
  DESIGN: ['DESIGN.md', 'DESIGN.template.md'],
  SPEC: ['SPEC.md', 'SPEC.template.md'],
  'DOCUMENT-REVIEW': ['DOCUMENT-REVIEW.md', 'DOCUMENT-REVIEW.template.md'],
  ARCHITECTURE: ['ARCHITECTURE.md', 'ARCHITECTURE.template.md'],
  PLAN: ['PLAN.md', 'PLAN.template.md'],
  'PLAN-REVIEW': ['PLAN-REVIEW.md', 'PLAN-REVIEW.template.md'],
  'TASKS-INDEX': ['TASKS-INDEX.md', 'TASKS-INDEX.template.md'],
  TASK: ['Phase-01--Task-01.md', 'TASK.template.md'],
  'IMPLEMENTATION-REVIEW': ['IMPLEMENTATION-REVIEW.md', 'IMPLEMENTATION-REVIEW.template.md'],
};

export const ARTIFACT_ALIASES = new Map([
  ['source-baseline', 'SOURCE-BASELINE'], ['source', 'SOURCE-BASELINE'],
  ['project-context', 'PROJECT-CONTEXT'], ['context', 'PROJECT-CONTEXT'],
  ['workflow-state', 'WORKFLOW-STATE'], ['state', 'WORKFLOW-STATE'],
  ['design-audit', 'DESIGN-AUDIT'], ['audit', 'DESIGN-AUDIT'],
  ['workpack', 'WORKPACK'], ['implementation-brief', 'IMPLEMENTATION-BRIEF'],
  ['brief', 'IMPLEMENTATION-BRIEF'], ['requirements', 'REQUIREMENTS'],
  ['design', 'DESIGN'], ['spec', 'SPEC'], ['specification', 'SPEC'],
  ['document-review', 'DOCUMENT-REVIEW'], ['architecture', 'ARCHITECTURE'],
  ['plan', 'PLAN'], ['plan-review', 'PLAN-REVIEW'],
  ['tasks-index', 'TASKS-INDEX'], ['task', 'TASK'],
  ['implementation-review', 'IMPLEMENTATION-REVIEW'], ['review', 'IMPLEMENTATION-REVIEW'],
]);

export const SNAPSHOT_KINDS = {
  design: 'DS', repo: 'REPO', repository: 'REPO', runtime: 'RUN',
  documentation: 'DOC', doc: 'DOC', asset: 'ASSET', assets: 'ASSET',
};

export const STAGES = [
  'Establish source baseline and workflow control',
  'Audit pinned design evidence',
  'Define requirements',
  'Document design intent',
  'Define testable behavior',
  'Review documentation consistency',
  'Define or explicitly skip architecture',
  'Create the repository-aware implementation plan',
  'Challenge and approve the plan',
  'Create the implementation task set',
  'Implement and validate tasks',
  'Complete final implementation review',
];
