import { Base64 } from "js-base64";
import { logger } from ".";
import { EnhancedDataEvent } from "../interfaces";
import octokit from "./octokit";

export const storeData = async (
  enhancedDataEvents: (EnhancedDataEvent | Promise<EnhancedDataEvent>)[]
) => {
  const resolvedEnhancedDataEvents = await Promise.all(enhancedDataEvents);

  resolvedEnhancedDataEvents.forEach((data) => {
    return octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: process.env.REPO_OWNER as string,
      repo: process.env.REPO_NAME as string,
      path: process.env.REPO_PATH as string,
      message: `auto(data): add ${data.dataEventSignature} for ${data.owner}/${data.repo}`,
      committer: {
        name: process.env.COMMITTER_NAME as string,
        email: process.env.COMMITTER_EMAIL as string,
      },
      author: {
        name: process.env.AUTHOR_NAME as string,
        email: process.env.AUTHOR_EMAIL as string,
      },
      content: Base64.encode(JSON.stringify(data)),
    });

    logger.complete(`File pushed to repo: "path/to/file.json"`);
  });
  return resolvedEnhancedDataEvents;
};
