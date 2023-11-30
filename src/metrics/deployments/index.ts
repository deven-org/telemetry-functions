import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import octokit from "../../core/octokit";
import { DeploymentOutput, DeploymentPayload } from "./interfaces";
import { decode } from "js-base64";
import { getTimestamp } from "../../shared/getTimestamp";

export const collectDeploymentMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.Deployment>> => {
  const payload = dataEvent.payload as DeploymentPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const env = payload.deployment.environment;
  const createdTime = getTimestamp(payload.deployment.created_at);
  const updatedTime = getTimestamp(payload.deployment.updated_at);
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
      (dep) => getTimestamp(dep.created_at) < createdTime
    );
    // If no previous deployment was found, timeSinceLastDeploy can't be determined
    if (deployment !== undefined) {
      const lastCommitTime = getTimestamp(deployment.created_at);
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
    status: "success",
    output,
  };
};
