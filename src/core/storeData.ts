import { Base64 } from "js-base64";
import { logger } from ".";
import { EnhancedDataEvent } from "../interfaces";
import octokit from "./octokit";

export const storeData = async (
  enhancedDataEvents: (EnhancedDataEvent | Promise<EnhancedDataEvent>)[]
) => {
  if (!enhancedDataEvents) return false;
  const resolvedEnhancedDataEvents = await Promise.all(enhancedDataEvents);

  for (const data of resolvedEnhancedDataEvents) {
    logger.pending(
      `Pushing file to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
    );

    //const actionType = data.output?.action ? ` - ${data.output.action} ` : "";

    try {
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: process.env.REPO_OWNER as string,
        repo: process.env.REPO_NAME as string,
        path: `${process.env.REPO_PATH}/${data.owner}/${data.repo}/${data.created_at}.json`,
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

      logger.complete(
        `File pushed to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
      );
    } catch (e) {
      console.log(e);
    }
  }
  return resolvedEnhancedDataEvents;
};
