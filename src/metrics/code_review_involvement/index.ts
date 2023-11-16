import { decode } from "js-base64";
import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { CodeReviewInvolvementOutput } from "./interfaces";
import moment from "moment";
import octokit from "../../core/octokit";
import { PullRequestClosedEvent } from "../../github.interfaces";

export const collectCodeReviewInvolvementMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as PullRequestClosedEvent;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const number = payload.number;
  const created_at = moment.utc(payload.pull_request.created_at).valueOf();
  const updated_at = moment.utc(payload.pull_request.updated_at).valueOf();
  const closed_at = moment.utc(payload.pull_request.closed_at).valueOf();
  const merged_at = moment.utc(payload.pull_request.merged_at).valueOf();
  const total_duration = closed_at - created_at;
  const created_to_merged_duration = merged_at - created_at;
  const updated_to_closed = closed_at - updated_at;
  const comments = payload.pull_request.comments;
  const review_comments = payload.pull_request.review_comments;
  const changed_files = payload.pull_request.changed_files;
  const has_been_merged_by_author =
    payload.pull_request.user.login === payload.pull_request.merged_by.login;
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
  } catch (e) {}
  const output: CodeReviewInvolvementOutput = {
    repo,
    owner,
    number,
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
