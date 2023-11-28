import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type DocumentationUpdatedPayload = MergedPullRequestClosedEvent;

export type DocumentationUpdatedOutput = {
  pr_id: number;
  mdFilesChanged: number;
};
