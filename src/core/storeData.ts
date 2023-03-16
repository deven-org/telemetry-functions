import { EnhancedDataEvent } from "./../interfaces";
import { logger } from ".";

export const storeData = (enhancedDataEvent: EnhancedDataEvent) => {
  logger.complete(`File pushed to repo: "path/to/file.json"`);

  console.log(enhancedDataEvent);
  /*const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  });*/
  /*
  return octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: process.env.REPO_OWNER as string,
    repo: process.env.REPO_NAME as string,
    path: data.path,
    message: data.message,
    committer: {
      name: process.env.COMMITTER_NAME as string,
      email: process.env.COMMITTER_EMAIL as string,
    },
    content: Base64.encode(JSON.stringify(data.content)),
  });*/
  return enhancedDataEvent;
};
