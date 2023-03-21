import {
  DataEvent,
  EnhancedDataEvent,
  MetricsSignature,
} from "../../interfaces";
import octokit from "../../core/octokit";
import { PullRequestClosedEvent } from "../../github.interfaces";
import moment from "moment";
import { CommitsPerPrOutput } from "./interfaces";
import { pathToFileURL } from "url";

export const collectCommitsPerPrMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as PullRequestClosedEvent;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const additions = payload.pull_request.additions;
  const deletions = payload.pull_request.deletions;
  let numberOfCommits = -1;
  let commit_timestamps: any;

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

    commit_timestamps = data.map(
      ({ commit }) => moment.utc(commit.author?.date).valueOf() || []
    );
  } catch (error) {
    commit_timestamps = [];
  }

  const output: CommitsPerPrOutput = {
    commits: numberOfCommits,
    additions,
    deletions,
    commit_timestamps,
    pull_number: payload.pull_request.number,
  };

  return {
    ...dataEvent,
    output,
    repo: repo,
    owner: owner,
    metricsSignature: MetricsSignature.CommitsPerPr,
  };
};
