import { logger } from "../../core";
import { getDuration } from "../../shared/getDuration";
import { getReleaseByTitle } from "./getReleaseByTitle";
import { keys, allPass, propEq } from "ramda";
import { DataEvent, EnhancedDataEvent } from "../../interfaces";
import {
  PullRequestClosedOutput,
  PullRequestClosedPayload,
} from "./interfaces";

export const collectPullRequestCompleteMetrics = (
  dataEvent: DataEvent
): EnhancedDataEvent => {
  const payload = dataEvent.payload as PullRequestClosedPayload;

  const output: PullRequestClosedOutput = {
    commits: payload.pull_request.commits,
    comments: payload.pull_request.comments,
    merged: payload.pull_request.merged,
    files_changed: payload.pull_request.changed_files,
    review_comments: payload.pull_request.review_comments,
    release: getReleaseByTitle(payload.pull_request.title),
    user: payload.pull_request.user.login,
    did_creator_merge:
      payload.pull_request.user.login === payload.pull_request.merged_by.login,
    duration: getDuration(
      payload.pull_request.created_at,
      payload.pull_request.merged_at
    ),
    requested_reviewers: Array.isArray(payload.requested_reviewers)
      ? payload.requested_reviewers.length
      : 0,
  };

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    output,
  };
};
