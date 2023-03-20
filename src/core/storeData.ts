import { Base64 } from "js-base64";
import { logger } from ".";
import { EnhancedDataEvent } from "../interfaces";
import octokit from "./octokit";

export const storeData = async (
  enhancedDataEvents: Promise<EnhancedDataEvent>[]
) => {
  console.log("Entering store data...");
  console.log("enhancedDataEvents", enhancedDataEvents);
  if (!enhancedDataEvents) return false;
  const resolvedEnhancedDataEvents = await Promise.all(enhancedDataEvents);

  console.log("resolvedEnhancedDataEvents", resolvedEnhancedDataEvents);
  resolvedEnhancedDataEvents.forEach(async (data) => {
    logger.info(
      `Pushing file to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
    );

    try {
      console.log({
        owner: process.env.REPO_OWNER as string,
        repo: process.env.REPO_NAME as string,
        path: `${process.env.REPO_PATH}/${data.created_at}.json`,
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

      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: process.env.REPO_OWNER as string,
        repo: process.env.REPO_NAME as string,
        path: `${process.env.REPO_PATH}/${data.created_at}.json`,
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
    } catch (e) {
      console.log("catch");
      console.log(e);
    }
    console.log("after request");
    logger.complete(
      `File pushed to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
    );
  });
  return resolvedEnhancedDataEvents;
};
