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
  /** Does the package.json exist */
  exists: boolean;

  /**
   * Is the package.json parsable?
   * null if file doesn't exist
   */
  parsable: null | boolean;

  /**
   * If package.json was found, parsed, and version is string: the version specified
   * Otherwise null
   */
  version: null | string;
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
   * null means the data could not be fetched due to reasons other than the file
   * not existing (status: 'networkError').
   *
   * NOTE: this will always look at the root package json of the repo at the
   * state of the commit that was deployed.
   * There is no guarantee that the version field has anything
   * to do with the deployment
   */
  package_json: PackageJsonInformation;
}
