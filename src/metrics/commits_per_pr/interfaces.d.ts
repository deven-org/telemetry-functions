import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type CommitsPerPrPayload = PullRequestClosedEvent;

export interface CommitsPerPrOutput {
  commits: number;
  additions: number;
  deletions: number;
  commit_timestamps: {
    /** Time commit was authored (UNIX ms) */
    authored: number | null;

    /** Time commit was committed (UNIX ms) */
    committed: number | null;
  }[];
  pr_id: number;
}
