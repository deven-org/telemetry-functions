import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type CommitsPerPrPayload = PullRequestClosedEvent;

export interface CommitsPerPrOutput {
  commits: number;
  additions: number;
  deletions: number;
  commit_timestamps: [];
  pull_number: number;
}
