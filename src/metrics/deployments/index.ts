import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import octokit from "../../core/octokit";
import moment from "moment";
import { DeploymentOutput, DeploymentPayload } from "./interfaces";
import { decode } from "js-base64";

export const collectDeploymentMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.Deployment>> => {
  const payload = dataEvent.payload as DeploymentPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const env = payload.deployment.environment;
  const createdTime = moment.utc(payload.deployment.created_at).valueOf();
  const updatedTime = moment.utc(payload.deployment.updated_at).valueOf();
  const duration = updatedTime - createdTime;

  let timeSinceLastDeploy: number | null = null;
  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/deployments?environment={environment}",
      {
        owner: owner,
        repo: repo,
        environment: env,
      }
    );

    // Make sure to get the last deployment before the current deployment
    const deployment = request.data.find(
      (dep) => moment.utc(dep.created_at).valueOf() < createdTime
    );
    // If no previous deployment was found, timeSinceLastDeploy can't be determined
    if (deployment !== undefined) {
      const lastCommitTime = moment.utc(deployment.created_at).valueOf();
      timeSinceLastDeploy = createdTime - lastCommitTime;
    }
  } catch (error) {
    console.log("error: ", error);
  }

  let version: string | null = null;
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: owner,
        repo: repo,
        path: "package.json",
      }
    );
    const content = JSON.parse(decode(response.data["content"]));
    version = content.version;
  } catch (error) {
    console.log("error: ", error);
  }

  const output: DeploymentOutput = {
    env,
    deployTime: createdTime,
    timeSinceLastDeploy,
    version,
    duration,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.Deployment,
    owner: owner,
    repo: repo,
    output,
  };
};
