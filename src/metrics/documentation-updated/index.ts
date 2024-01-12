import {
  SignedTriggerEvent,
  MetricSignature,
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
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.DocumentationUpdated>> => {
  const payload = triggerEvent.payload as DocumentationUpdatedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const prId = payload.pull_request.id;
  const headSha = payload.pull_request.head.sha;

  let status: MetricDataStatus = "success";
  let prFiles: DocumentationUpdatedOutput["pr_files"] = null;

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
      over_100_files: !singlePage,
      md_files_changed: mdFilesChanged,
    };
  }

  const output: DocumentationUpdatedOutput = {
    pr_id: prId,
    pr_files: prFiles,
    head_sha: headSha,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.DocumentationUpdated,
    owner,
    repo,
    status,
    output,
  };
};
