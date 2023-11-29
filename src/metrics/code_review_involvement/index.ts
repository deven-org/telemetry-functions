import { decode } from "js-base64";
import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import {
  CodeReviewInvolvementOutput,
  CodeReviewInvolvementPayload,
} from "./interfaces";
import octokit from "../../core/octokit";
import { logger } from "../../core/logger";
import { LogWarnings } from "../../shared/logMessages";
import { getTimestamp } from "../../shared/getTimestamp";

export const collectCodeReviewInvolvementMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.CodeReviewInvolvement>> => {
  const payload = dataEvent.payload as CodeReviewInvolvementPayload;

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

  let packages = [];
  try {
    const getPackageJson = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: owner,
        repo: repo,
        path: "package.json",
      }
    );
    packages = JSON.parse(decode(getPackageJson.data["content"]));
  } catch (e) {
    logger.warn(LogWarnings.packageJsonNotFound, `${owner}/${repo}`);
  }

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
    packages,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.CodeReviewInvolvement,
    owner,
    repo,
    output,
  };
};
