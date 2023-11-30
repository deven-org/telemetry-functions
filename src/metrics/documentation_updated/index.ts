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

  let mdFilesChanged = 0;

  try {
    // The maximum per_page value is 100. In case of very large PRs we might miss some .md-files.
    const request = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files?per_page=100",
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
    pr_id,
    mdFilesChanged,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.DocumentationUpdated,
    owner,
    repo,
    status: "success",
    output,
  };
};
