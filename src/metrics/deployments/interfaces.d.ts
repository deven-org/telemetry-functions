import { DeploymentCreatedEvent } from "@octokit/webhooks-types";

export type DeploymentPayload = DeploymentCreatedEvent;

export type DeploymentInformation = null | {
  /**
   * True if fetching deployments is successful but no previous deployment
   * to the requested environment is found.
   */
  is_initial_deployment: boolean;

  /**
   * Time in ms since last deployment created for the same environment.
   * null if previous deployment creation time cannot be found.
   */
  time_since_last_deploy: number | null;
};

export type PackageJsonInformation = null | {
  /** Boolean if the retrieved package.json file is successfully parsed */
  is_parsable: boolean;

  /**
   * Version field of root package.json in repo default branch.
   * null if there is no valid version found in package.json.
   *
   * NOTE: type is guessed since the json file might contain anything / not include a version
   */
  version: string | null;
};

export interface DeploymentOutput {
  /** Deployment environment name */
  env: string;

  /** Deployment creation time (UNIX ms) */
  deploy_time: number;

  /** Duration between deployment creation and last update */
  duration: number;

  /**
   * Relevant information depending on previous deployments to the current environment.
   * null if the list of deployments cannot be fetched (status: 'networkError')
   */
  environment_deployments: DeploymentInformation;

  /**
   * General information about the package.json.
   * null if package.json cannot be fetched (status: 'networkError')
   */
  package_json: PackageJsonInformation;
}
