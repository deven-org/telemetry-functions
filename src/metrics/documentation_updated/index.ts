import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import {
  DocumentationUpdatedOutput,
  DocumentationUpdatedPayload,
} from "./interfaces";
import octokit from "../../core/octokit";
import { logger } from "../../core/logger";

export const collectDocumentationUpdatedMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as DocumentationUpdatedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const number = payload.number;

  let mdFileNames: string[] = [];

  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      {
        owner: owner,
        repo: repo,
        pull_number: payload.pull_request.number,
      }
    );

    const data = request.data;

    const commitShas = data.map((commit) => commit.sha);

    for (let i = 0; i < commitShas.length; i++) {
      const commitSha = commitShas[i];
      const commitRequest = await octokit.request(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: owner,
          repo: repo,
          ref: commitSha,
        }
      );

      const fileNames = commitRequest.data.files
        ?.filter((file) => file.filename.endsWith(".md"))
        .map((file) => file.filename);

      if (fileNames) {
        mdFileNames = mdFileNames.concat(fileNames);
      }
    }
  } catch (error) {
    logger.error(error);
  }

  const mdFilesChanged = [...new Set(mdFileNames)].length;

  const output: DocumentationUpdatedOutput = {
    repo,
    owner,
    number,
    mdFilesChanged,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.DocumentationUpdated,
    owner,
    repo,
    output,
  };
};
