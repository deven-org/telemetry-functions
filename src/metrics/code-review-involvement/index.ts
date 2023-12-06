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
  const pr_id = payload.pull_request.id;
  const merged = payload.pull_request.merged;
  const created_at = getTimestamp(payload.pull_request.created_at);
  const updated_at = getTimestamp(payload.pull_request.updated_at);
  const closed_at = getTimestamp(payload.pull_request.closed_at);
  const merged_at =
    merged && payload.pull_request.merged_at
      ? getTimestamp(payload.pull_request.merged_at)
      : null;
  const total_duration = closed_at - created_at;
  const created_to_merged_duration =
    merged && merged_at ? merged_at - created_at : null;
  const updated_to_closed = closed_at - updated_at;
  const comments = payload.pull_request.comments;
  const review_comments = payload.pull_request.review_comments;
  const changed_files = payload.pull_request.changed_files;
  const has_been_merged_by_author =
    merged && payload.pull_request.merged_by
      ? payload.pull_request.user.login === payload.pull_request.merged_by.login
      : null;
  const requested_reviewers = Array.isArray(
    payload.pull_request.requested_reviewers
  )
    ? payload.pull_request.requested_reviewers.length
    : 0;
  const requested_teams = Array.isArray(payload.pull_request.requested_teams)
    ? payload.pull_request.requested_teams.length
    : 0;

  const output: CodeReviewInvolvementOutput = {
    pr_id,
    merged,
    created_at,
    updated_at,
    closed_at,
    merged_at,
    total_duration,
    created_to_merged_duration,
    updated_to_closed,
    comments,
    review_comments,
    changed_files,
    has_been_merged_by_author,
    requested_reviewers,
    requested_teams,
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
