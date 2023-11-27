import { PullRequestClosedEvent } from "@octokit/webhooks-types";

export type ReleaseVersionsPayload = PullRequestClosedEvent;

export type ReleaseVersionsOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Version found in PR Title (parsed by semver package coerce function)
   * null if not parseable as semver
   * See semver npm package docs for meaning of contents
   */
  title: null | {
    raw: string;
    major: number;
    minor: number;
    patch: number;
    prerelease: Array<string | number>;
    build: string[];
    version: string;
  };
};
