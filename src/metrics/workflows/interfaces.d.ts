import { WorkflowJobCompletedEvent } from "@octokit/webhooks-types";

export type WorkflowsPayload = WorkflowJobCompletedEvent;

export type WorkflowsOutput = {
  /** Id of the workflow job */
  id: number;

  /** Job creation time (UNIX ms) */
  created_at: number;

  /** Job start time (UNIX ms) */
  started_at: number;

  /** Job completion time (UNIX ms) */
  completed_at: number;

  /** Job run duration in ms */
  duration: number;

  /** Job conclusion, see github docs */
  conclusion: "success" | "failure" | "cancelled" | "skipped";

  /** The name of the workflow this job was executed in, if there is one */
  workflow_name: string | null;

  /** The workflow run attempt (>1 means it got restarted) */
  run_attempt: number;

  /** List of steps that were executed in the job that mention tests (same check as above) */
  steps: Array<{
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
