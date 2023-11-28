import octokit from "../../core/octokit";
import moment from "moment";

import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { CommitsPerPrOutput, CommitsPerPrPayload } from "./interfaces";

export const collectCommitsPerPrMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as CommitsPerPrPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const additions = payload.pull_request.additions;
  const deletions = payload.pull_request.deletions;
  let numberOfCommits = -1;
  let commit_timestamps: CommitsPerPrOutput["commit_timestamps"] = [];

  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      {
        owner: owner,
        repo: repo,
        pull_number: payload.pull_request.number,
      }
    );

    const data = request.data;
    numberOfCommits = data.length;

    // Checking the author date will not reflect amendments
    commit_timestamps = data.map(({ commit }) => ({
      authored: commit.author?.date
        ? moment.utc(commit.author.date).valueOf()
        : null,
      committed: commit.committer?.date
        ? moment.utc(commit.committer.date).valueOf()
        : null,
    }));
  } catch (error) {
    // TODO: send error output
  }

  const output: CommitsPerPrOutput = {
    commits: numberOfCommits,
    additions,
    deletions,
    commit_timestamps,
    pr_id: payload.pull_request.id,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.CommitsPerPr,
    owner: owner,
    repo: repo,
    output,
  };
};
