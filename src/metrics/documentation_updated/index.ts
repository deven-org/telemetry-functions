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

const MARKDOWN_FILE_EXTENSION = ".md";

export const collectDocumentationUpdatedMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as DocumentationUpdatedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const number = payload.number;

  let mdFilesChanged = 0;

  try {
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      {
        owner: owner,
        repo: repo,
        pull_number: payload.pull_request.number,
      }
    );

    mdFilesChanged = request.data.filter((file) =>
      file.filename.endsWith(MARKDOWN_FILE_EXTENSION)
    ).length;
  } catch (error) {
    logger.error(error);
  }

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
