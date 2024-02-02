import octokit from "../../core/octokit";

import {
  SignedTriggerEvent,
  MetricSignature,
  MetricData,
  MetricDataStatus,
} from "../../interfaces";
import { Commits, CommitsPerPrOutput, CommitsPerPrPayload } from "./interfaces";
import { getTimestamp } from "../../shared/get-timestamp";
import { LogErrors } from "../../shared/log-messages";
import { logger } from "../../core";

export const collectCommitsPerPrMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.CommitsPerPr>> => {
  const payload = triggerEvent.payload as CommitsPerPrPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const prId = payload.pull_request.id;
  const headSha = payload.pull_request.head.sha;
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
    .catch((error: unknown) => {
      status = "networkError";
      logger.error(LogErrors.networkErrorCommitsPerPR, prId, error);
      return null;
    });

  if (commitsResponse) {
    const data = commitsResponse.data;

    // Checking the author date will not reflect amendments
    const commitTimestamps = data.map(({ commit }) => ({
      authored: commit.author?.date ? getTimestamp(commit.author.date) : null,
      committed: commit.committer?.date
        ? getTimestamp(commit.committer.date)
        : null,
    }));

    commits = {
      amount: data.length,
      commit_timestamps: commitTimestamps,
    };
  }

  const output: CommitsPerPrOutput = {
    pr_id: prId,
    head_sha: headSha,
    additions,
    deletions,
    commits,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.CommitsPerPr,
    owner: owner,
    repo: repo,
    status,
    output,
  };
};
