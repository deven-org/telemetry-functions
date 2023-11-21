import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type ReleaseVersionsPayload = PullRequestClosedEvent;

export type ReleaseVersionsOutput = {
  pull_number: number;
  title: object;
};
