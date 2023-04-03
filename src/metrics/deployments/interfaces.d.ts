import { Deployment, Repository } from "../../github.interfaces";

export type DeploymentPayload = {
  action: "created";
  repository: Repository;
  deployment: Deployment;
};

export interface DeploymentOutput {
  env: string;
  deployTime: number;
  duration: number;
  version: string;
  timeSinceLastDeploy: number;
}
