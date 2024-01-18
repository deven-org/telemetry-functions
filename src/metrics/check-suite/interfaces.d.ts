import { CheckSuiteCompletedEvent } from "@octokit/webhooks-types";

export type CheckSuitePayload = CheckSuiteCompletedEvent;

export interface CheckSuiteMetricsOutput {
  /** Suite conclusion (see GitHub docs) */
  conclusion: string;

  /** Check suite creation time (UNIX ms) */
  created_at: number;

  /** Check suite last updated time (UNIX ms) */
  updated_at: number;

  /** Is check suite configured for / sent to a GitHub app? */
  is_app_owner: boolean;

  /** An array of PR IDs that match this check suite */
  pull_requests: Array<{
    /** Pull Request ID */
    id: number;
  }>;
}
