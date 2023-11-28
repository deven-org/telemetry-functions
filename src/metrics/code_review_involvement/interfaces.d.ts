import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type CodeReviewInvolvementPayload = PullRequestClosedEvent;

export type CodeReviewInvolvementOutput = {
  pr_id: number;
  merged: boolean;
  created_at: number;
  updated_at: number;
  closed_at: number;
  merged_at: number | null;
  total_duration: number;
  created_to_merged_duration: number | null;
  updated_to_closed: number;
  comments: number;
  review_comments: number;
  changed_files: number;
  has_been_merged_by_author: boolean | null;
  requested_reviewers: number;
  requested_teams: number;
  packages: any;
};
