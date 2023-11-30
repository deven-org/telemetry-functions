import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type DocumentationUpdatedPayload = MergedPullRequestClosedEvent;

export type DocumentationUpdatedOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Data based on the files in the PR.
   * null means the additional data could not be fetched (status: 'networkError')
   */
  prFiles: null | {
    /**
     * Number of Markdown files changed in PR
     * This can be inexact if PR has over 100 files
     */
    mdFilesChanged: number;
  };
};
