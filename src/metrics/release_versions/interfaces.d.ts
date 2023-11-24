import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type ReleaseVersionsPayload = PullRequestClosedEvent;

export type ReleaseVersionsOutput = {
  pr_id: number;
  title: object;
};
