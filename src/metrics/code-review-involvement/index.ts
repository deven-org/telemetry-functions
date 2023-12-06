import {
  SignedTriggerEvent,
  MetricSignature,
  MetricData,
} from "../../interfaces";
import {
  CodeReviewInvolvementOutput,
  CodeReviewInvolvementPayload,
} from "./interfaces";
import { getTimestamp } from "../../shared/get-timestamp";

export const collectCodeReviewInvolvementMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.CodeReviewInvolvement>> => {
  const payload = triggerEvent.payload as CodeReviewInvolvementPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const prId = payload.pull_request.id;
  const merged = payload.pull_request.merged;
  const createdAt = getTimestamp(payload.pull_request.created_at);
  const updatedAt = getTimestamp(payload.pull_request.updated_at);
  const closedAt = getTimestamp(payload.pull_request.closed_at);
  const mergedAt =
    merged && payload.pull_request.merged_at
      ? getTimestamp(payload.pull_request.merged_at)
      : null;
  const totalDuration = closedAt - createdAt;
  const createdToMergedDuration =
    merged && mergedAt ? mergedAt - createdAt : null;
  const updatedToClosed = closedAt - updatedAt;
  const comments = payload.pull_request.comments;
  const reviewComments = payload.pull_request.review_comments;
  const changedFiles = payload.pull_request.changed_files;
  const hasBeenMergedByAuthor =
    merged && payload.pull_request.merged_by
      ? payload.pull_request.user.login === payload.pull_request.merged_by.login
      : null;
  const requestedReviewers = Array.isArray(
    payload.pull_request.requested_reviewers
  )
    ? payload.pull_request.requested_reviewers.length
    : 0;
  const requestedTeams = Array.isArray(payload.pull_request.requested_teams)
    ? payload.pull_request.requested_teams.length
    : 0;

  const output: CodeReviewInvolvementOutput = {
    pr_id: prId,
    merged,
    created_at: createdAt,
    updated_at: updatedAt,
    closed_at: closedAt,
    merged_at: mergedAt,
    total_duration: totalDuration,
    created_to_merged_duration: createdToMergedDuration,
    updated_to_closed: updatedToClosed,
    comments,
    review_comments: reviewComments,
    changed_files: changedFiles,
    has_been_merged_by_author: hasBeenMergedByAuthor,
    requested_reviewers: requestedReviewers,
    requested_teams: requestedTeams,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.CodeReviewInvolvement,
    owner,
    repo,
    status: "success",
    output,
  };
};
