import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
  MetricDataStatus,
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
): Promise<MetricData<MetricsSignature.DocumentationUpdated>> => {
  const payload = dataEvent.payload as DocumentationUpdatedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const pr_id = payload.pull_request.id;

  let status: MetricDataStatus = "success";
  let prFiles: DocumentationUpdatedOutput["prFiles"] = null;

  const prFilesResponse = await octokit
    .request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner: owner,
      repo: repo,
      pull_number: payload.pull_request.number,
      per_page: 100,
    })
    .catch((error) => {
      status = "networkError";
      logger.error(error);
      return null;
    });

  if (prFilesResponse) {
    const singlePage = !prFilesResponse.headers.link;
    const mdFilesChanged = prFilesResponse.data.filter((file) =>
      file.filename.endsWith(MARKDOWN_FILE_EXTENSION)
    ).length;

    prFiles = {
      over100Files: !singlePage,
      mdFilesChanged,
    };
  }

  const output: DocumentationUpdatedOutput = {
    pr_id,
    prFiles,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.DocumentationUpdated,
    owner,
    repo,
    status,
    output,
  };
};
