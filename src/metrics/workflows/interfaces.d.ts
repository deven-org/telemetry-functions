export type WorkflowJobCompletedOutput = {
  /** X The GitHub repository name */
  repository: string;

  /** X UNIX timestamp of job creation time */
  created_at: number;

  /** X UNIX timestamp of job start time */
  started_at: number;

  /** X UNIX timestamp of job completion time */
  completed_at: number;

  /** Job run duration in ms */
  duration: number;

  /** X Job status (always "completed" due to condition) */
  status: string;

  /** The name of the workflow this job was executed in */
  workflow_name: string;

  /** The workflow run attempt (>1 means it got restarted) */
  run_attempt: number;

  /** List of steps that were executed as part of the job */
  steps: Array<{
    /** Step name */
    name: string;

    /** X Step status (always "completed" due to condition) */
    status: string;

    /** Step conclusion, see github docs */
    conclusion: string;

    /** Step number */
    number: number;

    /** X Unix timestamp of step execution start */
    started_at: number;

    /** X Unix timestamp of step execution end */
    completed_at: number;

    /** Step duration in ms */
    duration: number;
  }>;

  /**
   * Full content of the root package.json at the source repo's default branch
   * NOTE: type is guessed since the json file might contain anythingn
   */
  packages: object; // package.json contents
};
