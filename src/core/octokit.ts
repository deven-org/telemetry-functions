import { Octokit } from "@octokit/rest";

export default new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

// Uses special token with write access to data repo
export const octokitForDataRepo = new Octokit({
  auth: process.env.REPO_WRITE_ACCESS_TOKEN,
});
