import { Octokit } from "@octokit/rest";
import {
  KnownEnvironmentVariable,
  getOptionalEnvVar,
} from "../shared/get-env-var";

function createOctokit(
  githubAccessToken: string | undefined,
  envVar: KnownEnvironmentVariable
): Octokit {
  return new Octokit({
    auth: githubAccessToken ?? getOptionalEnvVar(envVar),
  });
}

export const createOctokitForSourceRepo = (
  githubAccessToken?: string
): Octokit => {
  return createOctokit(githubAccessToken, "GITHUB_ACCESS_TOKEN");
};

// Uses special token with write access to data repo
// If no token was given, it defaults to environment variable REPO_WRITE_ACCESS_TOKEN
export const createOctokitForDataRepo = (
  githubAccessToken?: string
): Octokit => {
  return createOctokit(githubAccessToken, "REPO_WRITE_ACCESS_TOKEN");
};
