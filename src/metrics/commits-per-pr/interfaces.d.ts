import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type CommitsPerPrPayload = MergedPullRequestClosedEvent;

export type Commits = null | {
  /**
   * Number of commits in closed PR
   */
  amount: number;

  /**
   * Timestamps of when commit author/committer created the commit.
   */
  commit_timestamps: {
    /** Time commit was authored (UNIX ms) */
    authored: number | null;

    /** Time commit was committed (UNIX ms) */
    committed: number | null;
  }[];
};

export interface CommitsPerPrOutput {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /** Number of additions (lines) determined by GitHub */
  additions: number;

  /** Number of deletions (lines) determined by GitHub */
  deletions: number;

  /**
   * The commits of the PR.
   * null if PR commit list cannot be fetched from GitHub (status: 'networkError')
   */
  commits: Commits;
}
