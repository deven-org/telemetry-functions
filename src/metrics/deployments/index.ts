import {
  SignedTriggerEvent,
  MetricSignature,
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
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.Deployment>> => {
  const payload = triggerEvent.payload as DeploymentPayload;

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
        is_initial_deployment: false,
        time_since_last_deploy: createdTime - lastCommitTime,
      };
    } else {
      // If no previous deployment to the current environment was found
      // there is no time since last deploy and it is the initial deployment.
      deploymentInfo = {
        is_initial_deployment: true,
        time_since_last_deploy: null,
      };
    }
  }

  const packageJsonResponse = await octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      ref: payload.deployment.sha,
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
        is_parsable: true,
        version: content.version,
      };
    } catch (error: unknown) {
      packageJson = {
        is_parsable: false,
        version: null,
      };
      logger.error(LogErrors.parseErrorPackageJson, `${owner}/${repo}`);
    }
  }

  const output: DeploymentOutput = {
    env,
    deploy_time: createdTime,
    duration,
    environment_deployments: deploymentInfo,
    package_json: packageJson,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.Deployment,
    owner: owner,
    repo: repo,
    status,
    output,
  };
};
