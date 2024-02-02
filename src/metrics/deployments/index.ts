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
import { getTimestamp } from "../../shared/get-timestamp";
import { logger } from "../../core";
import { LogErrors, LogWarnings } from "../../shared/log-messages";
import { octokitJsonResponseHandler } from "../../shared/octokit-json-response-handler";

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
    .request("GET /repos/{owner}/{repo}/deployments", {
      owner: owner,
      repo: repo,
      environment: env,
    })
    .catch((error: unknown) => {
      status = "networkError";
      logger.error(
        LogErrors.networkErrorDeployments,
        `${owner}/${repo}/${env}`,
        error
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

  const packageJsonResponse = await octokitJsonResponseHandler(
    octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      ref: payload.deployment.sha,
      path: "package.json",
    })
  );

  switch (packageJsonResponse.variant) {
    case "unexpected-error":
      status = "networkError";
      logger.error(LogErrors.networkErrorPackageJson, `${owner}/${repo}`);
      packageJson = null;
      break;
    case "missing":
      logger.warn(LogWarnings.rootPackageJsonNotFound, `${owner}/${repo}`);
      packageJson = { exists: false, parsable: null, version: null };
      break;
    case "unparsable":
      logger.warn(LogWarnings.rootPackageJsonNotParsable, `${owner}/${repo}`);
      packageJson = { exists: true, parsable: false, version: null };
      break;
    case "parsable":
    default:
      // ^ TS will error if there is a new variant that has different content
      if (typeof packageJsonResponse.content.version !== "string") {
        logger.warn(
          LogWarnings.rootPackageJsonNonStringVersion,
          `${owner}/${repo}`
        );
        packageJson = { exists: true, parsable: true, version: null };
      } else {
        packageJson = {
          exists: true,
          parsable: true,
          version: packageJsonResponse.content.version,
        };
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
