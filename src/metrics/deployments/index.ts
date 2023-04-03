import {
  DataEvent,
  EnhancedDataEvent,
  MetricsSignature,
} from "../../interfaces";
import octokit from "../../core/octokit";
import moment from "moment";
import { DeploymentOutput, DeploymentPayload } from "./interfaces";
import { decode } from "js-base64";

let timeSinceLastDeploy: number;
let version: string;
let duration: number;

export const collectDeploymentMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as DeploymentPayload;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const env = payload.deployment.environment;
  const createdTime = moment.utc(payload.deployment.created_at).valueOf();
  const updatedTime = moment.utc(payload.deployment.updated_at).valueOf();

  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/deployments",
      {
        owner: owner,
        repo: repo,
      }
    );

    const deployment = request.data.find((o) => o.environment === env);
    const lastCommitTime = moment.utc(deployment?.created_at).valueOf();
    timeSinceLastDeploy = createdTime - lastCommitTime;
    duration = updatedTime - createdTime;
  } catch (error) {
    console.log("error: ", error);
    timeSinceLastDeploy = 0;
    duration = 0;
  }

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
    version = "";
  }

  const output: DeploymentOutput = {
    env,
    deployTime: createdTime,
    timeSinceLastDeploy,
    version,
    duration,
  };

  return {
    ...dataEvent,
    output,
    repo: repo,
    owner: owner,
    metricsSignature: MetricsSignature.Deployment,
  };
};
