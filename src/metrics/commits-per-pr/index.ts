import octokit from "../../core/octokit";

import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
  MetricDataStatus,
} from "../../interfaces";
import { Commits, CommitsPerPrOutput, CommitsPerPrPayload } from "./interfaces";
import { getTimestamp } from "../../shared/get-timestamp";
import { LogErrors } from "../../shared/log-messages";
import { logger } from "../../core";

export const collectCommitsPerPrMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.CommitsPerPr>> => {
  const payload = dataEvent.payload as CommitsPerPrPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pr_id = payload.pull_request.id;
  const additions = payload.pull_request.additions;
  const deletions = payload.pull_request.deletions;

  let status: MetricDataStatus = "success";
  let commits: Commits = null;

  const commitsResponse = await octokit
    .request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
      owner: owner,
      repo: repo,
      pull_number: payload.pull_request.number,
    })
    .catch(() => {
      status = "networkError";
      logger.error(LogErrors.networkErrorCommitsPerPR, pr_id);
      return null;
    });

  if (commitsResponse) {
    const data = commitsResponse.data;

    // Checking the author date will not reflect amendments
    const commit_timestamps = data.map(({ commit }) => ({
      authored: commit.author?.date ? getTimestamp(commit.author.date) : null,
      committed: commit.committer?.date
        ? getTimestamp(commit.committer.date)
        : null,
    }));

    commits = {
      amount: data.length,
      commit_timestamps,
    };
  }

  const output: CommitsPerPrOutput = {
    pr_id,
    additions,
    deletions,
    commits,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.CommitsPerPr,
    owner: owner,
    repo: repo,
    status,
    output,
  };
};
