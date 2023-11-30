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
): Promise<MetricData<MetricsSignature.DocumentationUpdated>> => {
  const payload = dataEvent.payload as DocumentationUpdatedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const pr_id = payload.pull_request.id;

  const prFiles: DocumentationUpdatedOutput["prFiles"] = await octokit
    .request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner: owner,
      repo: repo,
      pull_number: payload.pull_request.number,
      per_page: 100,
    })
    .then(
      function onSuccess(response) {
        const mdFilesChanged = response.data.filter((file) =>
          file.filename.endsWith(MARKDOWN_FILE_EXTENSION)
        ).length;

        return {
          mdFilesChanged,
        };
      },
      function onError(error) {
        logger.error(error);
        return null;
      }
    );

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
    status: prFiles ? "success" : "networkError",
    output,
  };
};
