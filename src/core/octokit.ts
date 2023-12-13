import { Octokit } from "@octokit/rest";
import { getOptionalEnvVar } from "../shared/get-env-var";

// tokens optional to not urge devs to use real access tokens for testing, and
// because it is read at import-time, which means errors aren't handled well.

export default new Octokit({
  auth: getOptionalEnvVar("GITHUB_ACCESS_TOKEN"),
});

// Uses special token with write access to data repo
export const octokitForDataRepo = new Octokit({
  auth: getOptionalEnvVar("REPO_WRITE_ACCESS_TOKEN"),
});
