import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
  MetricDataStatus,
} from "../../interfaces";
import octokit from "../../core/octokit";
import {
  DeploymentInformation,
  DeploymentOutput,
  DeploymentPayload,
  PackageJsonInformation,
} from "./interfaces";
import { decode } from "js-base64";
import { getTimestamp } from "../../shared/get-timestamp";
import { logger } from "../../core";
import { LogErrors } from "../../shared/log-messages";

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

  let status: MetricDataStatus = "success";
  let deploymentInfo: DeploymentInformation = null;
  let packageJson: PackageJsonInformation = null;

  const deploymentResponse = await octokit
    .request(
      "GET /repos/{owner}/{repo}/deployments?environment={environment}",
      {
        owner: owner,
        repo: repo,
        environment: env,
      }
    )
    .catch(() => {
      status = "networkError";
      logger.error(
        LogErrors.networkErrorDeployments,
        `${owner}/${repo}/${env}`
      );
      return null;
    });

  if (deploymentResponse) {
    // Make sure to get the last deployment before the current deployment
    const deployment = deploymentResponse.data.find(
      (dep) => getTimestamp(dep.created_at) < createdTime
    );

    if (deployment !== undefined) {
      const lastCommitTime = getTimestamp(deployment.created_at);
      deploymentInfo = {
        isInitialDeployment: false,
        timeSinceLastDeploy: createdTime - lastCommitTime,
      };
    } else {
      // If no previous deployment to the current environment was found
      // there is no time since last deploy and it is the initial deployment.
      deploymentInfo = {
        isInitialDeployment: true,
        timeSinceLastDeploy: null,
      };
    }
  }

  const packageJsonResponse = await octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      path: "package.json",
    })
    .catch(() => {
      status = "networkError";
      logger.error(LogErrors.networkErrorPackageJson, `${owner}/${repo}`);
      return null;
    });

  if (packageJsonResponse) {
    try {
      const content = JSON.parse(decode(packageJsonResponse.data["content"]));

      packageJson = {
        isParseable: true,
        version: content.version,
      };
    } catch (error: unknown) {
      packageJson = {
        isParseable: false,
        version: null,
      };
      logger.error(LogErrors.parseErrorPackageJson, `${owner}/${repo}`);
    }
  }

  const output: DeploymentOutput = {
    env,
    deployTime: createdTime,
    duration,
    environmentDeployments: deploymentInfo,
    packageJson,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.Deployment,
    owner: owner,
    repo: repo,
    status,
    output,
  };
};
