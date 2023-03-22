
export type WorkflowJobTestCoverageOutput = {
  repository: string,
  workflow_name: string,
  hasTestWokflowFailed: boolean,
  hasTestStepFailed: boolean,
  test_step_duration: number | undefined,
  test_step_status: string | undefined,
  test_step_conclusion: string | undefined
};
