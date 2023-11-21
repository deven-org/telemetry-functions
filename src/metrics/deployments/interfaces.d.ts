import { DeploymentCreatedEvent } from "@octokit/webhooks-types";

export type DeploymentPayload = DeploymentCreatedEvent;

export interface DeploymentOutput {
  env: string;
  deployTime: number;
  duration: number;
  version: string;
  timeSinceLastDeploy: number;
}
