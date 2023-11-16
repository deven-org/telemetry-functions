export interface DeploymentOutput {
  env: string;
  deployTime: number;
  duration: number;
  version: string;
  timeSinceLastDeploy: number;
}
