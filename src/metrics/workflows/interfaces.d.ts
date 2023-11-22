import { WorkflowJobCompletedEvent } from "@octokit/webhooks-types";

export type WorkflowsPayload = WorkflowJobCompletedEvent;

export type WorkflowsOutput = {
  /** UNIX timestamp of job creation time */
  created_at: number;

  /** UNIX timestamp of job start time */
  started_at: number;

  /** UNIX timestamp of job completion time */
  completed_at: number;

  /** Job run duration in ms */
  duration: number;

  /** Job status (always "completed" due to condition) */
  status: string;

  /** The name of the workflow this job was executed in */
  workflow_name: string | null;

  /** The workflow run attempt (>1 means it got restarted) */
  run_attempt: number;

  /** List of steps that were executed as part of the job */
  steps: Array<{
    /** Step name */
    name: string;

    /** Step status (always "completed" due to condition) */
    status: string;

    /** Step conclusion, see github docs */
    conclusion: string;

    /** Step number */
    number: number;

    /** Unix timestamp of step execution start */
    started_at: number;

    /** Unix timestamp of step execution end */
    completed_at: number;

    /** Step duration in ms */
    duration: number;
  }>;
};
