import { DeploymentCreatedEvent } from "@octokit/webhooks-types";

export type DeploymentPayload = DeploymentCreatedEvent;

export interface DeploymentOutput {
  /** Deployment environment name */
  env: string;

  /** Deployment creation time (UNIX ms) */
  deployTime: number;

  /** Duration between deployment creation and last update */
  duration: number;

  /**
   * Version field of root package.json in repo default branch.
   * null if the package.json cannot be fetched.
   *
   * NOTE: type is guessed since the json file might contain anything / not include a version
   */
  version: string | null;

  /**
   * Time in ms since last deployment created for the same environment.
   * null if previous deployment creation time cannot be found/fetched.
   */
  timeSinceLastDeploy: number | null;
}
