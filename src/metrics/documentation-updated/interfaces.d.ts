import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type DocumentationUpdatedPayload = MergedPullRequestClosedEvent;

export type DocumentationUpdatedOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Data based on the files in the PR.
   * null means the additional data could not be fetched (status: 'networkError')
   */
  pr_files: null | {
    /** Did this PR have >100 files? */
    over_100_files: boolean;

    /**
     * Number of Markdown files changed in PR
     * This can be inexact if over_100_files is true
     */
    md_files_changed: number;
  };

  /** Sha of the head of the workflow job */
  head_sha: string;
};
