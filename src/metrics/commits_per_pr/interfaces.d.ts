import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type CommitsPerPrPayload = PullRequestClosedEvent;

export interface CommitsPerPrOutput {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /** Number of additions (lines) determined by GitHub */
  additions: number;

  /** Number of deletions (lines) determined by GitHub */
  deletions: number;

  /**
   * Number of commits in closed PR
   * -1 if PR commit list cannot be fetched from GitHub
   */
  commits: number;

  /**
   * Timestamps of when commit author/committer created the commit.
   *
   * [] if commit list cannot be fetched from GitHub
   */
  commit_timestamps: {
    /** Time commit was authored (UNIX ms) */
    authored: number | null;

    /** Time commit was committed (UNIX ms) */
    committed: number | null;
  }[];
}
