import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type DocumentationUpdatedPayload = MergedPullRequestClosedEvent;

export type DocumentationUpdatedOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Number of Markdown files changed in PR
   * This can be inexact for PRs with >100 files changed
   */
  mdFilesChanged: number;
};
