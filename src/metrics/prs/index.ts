import { DataEvent, logger, MergedPrOutput, MergedPrPayload } from "../../core";
import { getDuration } from "../../shared/getDuration";
import { getReleaseByTitle } from "./getReleaseByTitle";
import { keys } from "ramda";

export const collectMergedPrMetrics = (dataEvent: DataEvent): DataEvent => {
  const payload = dataEvent.payload as MergedPrPayload;

  const output: MergedPrOutput = {
    commits: payload.pull_request.commits,
    comments: payload.pull_request.comments,
    merged: payload.pull_request.merged,
    changed_files: payload.pull_request.changed_files,
    review_comments: payload.pull_request.review_comments,
    release: getReleaseByTitle(payload.pull_request.title),
    duration: getDuration(
      payload.pull_request.created_at,
      payload.pull_request.merged_at
    ),
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
