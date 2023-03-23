export type WorkflowJobTestCoverageOutput = {
  id: number;
  status: string;
  conclusion: string;
  is_workflow_name_about_test: boolean;
  steps_about_test: object[];
  has_failed_steps: boolean;
  total_tests_duration: number;
};
