import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type CodeReviewInvolvementPayload = PullRequestClosedEvent;

export type CodeReviewInvolvementOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /** Was the PR merged or just closed? */
  merged: boolean;

  /** PR creation time (UNIX ms) */
  created_at: number;

  /** PR last updated time (UNIX ms) */
  updated_at: number;

  /** PR closed time (UNIX ms) */
  closed_at: number;

  /** PR merged time (UNIX ms), null if not merged */
  merged_at: number | null;

  /** Duration in ms between created and closed */
  total_duration: number;

  /** Duration in ms between created and merged, null if not merged */
  created_to_merged_duration: number | null;

  /** Duration in ms between last updated and closed */
  updated_to_closed: number;

  /** Number of comments on PR */
  comments: number;

  /** Number of review comments on PR */
  review_comments: number;

  /** Number of changed files */
  changed_files: number;

  /** Is PR author same user as PR merger? null if not merged */
  has_been_merged_by_author: boolean | null;

  /** Number of individual reviewers the author requested */
  requested_reviewers: number;

  /** Number of team reviewers the author requested */
  requested_teams: number;
};
