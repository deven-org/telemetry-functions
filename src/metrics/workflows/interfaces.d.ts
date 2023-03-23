export interface WorkflowJobStep {
  name: string;
  status: string;
  conclusion: string;
  number: number;
  started_at: string;
  completed_at: string;
}
export type WorkflowJobCompletedPayload = {
  action: string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  workflow_job: {
    id: number;
    completed_at: string;
    started_at: string;
    created_at: string;
    status: string;
    workflow_name: string;
    run_attempt: number;
    steps: WorkflowJobStep[];
    conclusion: string;
  };
};
export type WorkflowJobCompletedOutput = any;
