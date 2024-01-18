import { CheckSuiteCompletedEvent } from "@octokit/webhooks-types";

export type CheckSuitePayload = CheckSuiteCompletedEvent;

export interface CheckSuiteMetricsOutput {
  /** Suite ID (see GitHub docs)  */
  id: number;

  /** Suite conclusion (see GitHub docs) */
  conclusion: string;

  /** Check suite creation time (UNIX ms) */
  created_at: number;

  /** Check suite last updated time (UNIX ms) */
  updated_at: number;

  /** Is check suite configured for / sent to a GitHub app? */
  is_app_owner: boolean;

  /** SHA of HEAD for check suite  */
  head_sha: string;

  /** An array of PR IDs that match this check suite */
  pull_requests: Array<{
    /** Pull Request ID */
    id: number;
  }>;
}
