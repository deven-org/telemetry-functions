import {
  DataEvent,
  EnhancedDataEvent,
  MetricsSignature,
} from "../../interfaces";
import octokit from "../../core/octokit";
// import { PullRequestClosedEvent } from "../../github.interfaces";
import moment from "moment";
import { DeploymentOutput, DeploymentPayload } from "./interfaces";

export const collectDeploymentMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as DeploymentPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const env = payload.deployment.environment;
  const deployTime = moment.utc(payload.deployment.created_at).valueOf();

  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/deployments",
      {
        owner: owner,
        repo: repo,
      }
    );

    const deployment = request.data.find((o) => o.environment === env);

    console.log({ deployment });

    // const data = request.data;
    // numberOfCommits = data.length;

    // commit_timestamps = data.map(
    //   ({ commit }) => moment.utc(commit.author?.date).valueOf() || []
    // );
  } catch (error) {}

  // const output: CommitsPerPrOutput = {
  //   commits: numberOfCommits,
  //   additions,
  //   deletions,
  //   commit_timestamps,
  //   pull_number: payload.pull_request.number,
  // };

  return {
    ...dataEvent,
    // output,
    repo: repo,
    owner: owner,
    metricsSignature: MetricsSignature.Deployment,
  };
};
