import { PullRequestClosedEvent, User } from "@octokit/webhooks-types";

export interface MergedPullRequestClosedEvent extends PullRequestClosedEvent {
  pull_request: PullRequestClosedEvent["pull_request"] & {
    merged: true;
    merged_at: string;
    merged_by: User;
  };
}
