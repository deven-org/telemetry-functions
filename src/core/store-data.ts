import { Base64 } from "js-base64";
import { logger } from ".";
import { MetricData } from "../interfaces";
import octokit from "./octokit";

export const storeData = async (metricData: MetricData[]) => {
  for (const data of metricData) {
    logger.pending(
      `Pushing file to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
    );

    const actionType = data.metricsSignature
      ? ` - ${data.metricsSignature} `
      : " ";

    const path = `${process.env.REPO_PATH}/${data.owner}/${data.repo}/${data.metricsSignature}/${data.created_at}.json`;
    try {
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: process.env.REPO_OWNER as string,
        repo: process.env.REPO_NAME as string,
        path,
        message: `auto(data): add ${data.dataEventSignature}${actionType}for ${data.owner}/${data.repo}`,
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

      logger.complete(`File pushed to repo: ${path}`);
    } catch (e) {
      console.log(e);
    }
  }
  return metricData;
};
