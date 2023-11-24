import { MergedPullRequestClosedEvent } from "../../github.interfaces";

export type DocumentationUpdatedPayload = MergedPullRequestClosedEvent;

export type DocumentationUpdatedOutput = {
  repo: string;
  owner: string;
  pr_id: number;
  mdFilesChanged: number;
};
