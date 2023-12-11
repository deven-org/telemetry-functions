import { Base64 } from "js-base64";
import { ErrorForLogger, errorLogger, logger } from ".";
import { MetricData } from "../interfaces";
import { octokitForDataRepo } from "./octokit";
import { storeDataStaggerTimeout } from "./store-data-stagger-timeout";
import { LogErrors } from "../shared/log-messages";

export const storeData = async (metricData: MetricData[]) => {
  const errored: string[] = [];

  for (const data of metricData) {
    logger.pending(
      `Pushing file to repo: ${process.env.REPO_PATH}/${data.created_at}.json`
    );

    const identifier = `${data.trigger_event_signature} => ${data.metric_signature}`;
    const path = `${process.env.REPO_PATH}/${data.owner}/${data.repo}/${data.metric_signature}/${data.created_at}.json`;
    try {
      await octokitForDataRepo.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: process.env.REPO_OWNER as string,
          repo: process.env.REPO_NAME as string,
          path,
          message: `auto(data): add ${identifier} for ${data.owner}/${data.repo}`,
          committer: {
            name: process.env.COMMITTER_NAME as string,
            email: process.env.COMMITTER_EMAIL as string,
          },
          author: {
            name: process.env.AUTHOR_NAME as string,
            email: process.env.AUTHOR_EMAIL as string,
          },
          content: Base64.encode(JSON.stringify(data)),
        }
      );

      logger.complete(`File pushed to repo: ${path}`);
    } catch (e) {
      errorLogger(e);
      errored.push(identifier);
    }

    // Timeout to prevent GitHub errors - see function documentation
    await storeDataStaggerTimeout();
  }

  if (errored.length) {
    throw new ErrorForLogger(
      "error",
      LogErrors.couldNotStoreData,
      JSON.stringify(errored, undefined, 2)
    );
  }

  return metricData;
};
