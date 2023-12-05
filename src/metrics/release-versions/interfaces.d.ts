import { CreateEvent } from "@octokit/webhooks-types";

export type ReleaseVersionsPayload = CreateEvent;

/**
 * See semver npm package docs for meaning of contents
 */
export type ReleaseVersion = {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: ReadonlyArray<string | number>;
  build: ReadonlyArray<string>;
  version: string;
};

export type ReleaseVersionsOutput = {
  /**
   * Version found in tag (parsed by semver package)
   */
  releaseVersion: ReleaseVersion;
};
