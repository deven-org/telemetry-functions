import { WorkflowJobCompletedEvent } from "@octokit/webhooks-types";

export type TestCoveragePayload = WorkflowJobCompletedEvent;

export type WorkflowJobTestCoverageOutput = {
  /** GitHub Job ID */
  id: number;

  /** Job conclusion, see GitHub docs */
  conclusion: "success" | "failure" | "cancelled" | "skipped";

  /** If the workflow that ran this job seems to be about tests */
  is_workflow_name_about_test: boolean;

  /** If this job seems to be about tests */
  is_job_name_about_test: boolean;

  /** If any job steps that mention tests failed */
  has_failed_steps: boolean;

  /** Duration of all job steps that mention tests */
  total_tests_duration: number;

  /** List of steps that were executed in the job that mention tests */
  steps_about_test: Array<{
    /** Step name */
    name: string;

    /** Step conclusion, see github docs */
    conclusion: "success" | "failure" | "skipped";

    /** Step number */
    number: number;

    /** Step execution start time (UNIX ms) */
    started_at: number;

    /** Step execution completion time (UNIX ms) */
    completed_at: number;

    /** Step duration in ms */
    duration: number;
  }>;
};
