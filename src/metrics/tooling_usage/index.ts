import { logger } from "../../core";
import {
  SignedDataEvent,
  MetricData,
  MetricsSignature,
} from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import octokit from "../../core/octokit";
import { decode } from "js-base64";
import { LogWarnings } from "../../shared/logMessages";

export const collectToolingUsageMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as ToolingUsagePayload;

  let output: ToolingUsageOutput;

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: payload.owner,
        repo: payload.repo,
        path: "deven-skeleton-install.config.json",
      }
    );

    const { version } = JSON.parse(decode(response.data["content"]));

    output = {
      hasDocumentationSkeleton: true,
      documentationSkeletonVersion: version,
    };
  } catch (error) {
    output = {
      hasDocumentationSkeleton: false,
      documentationSkeletonVersion: undefined,
    };

    logger.warn(
      LogWarnings.documentationSkeletonConfigNotFound,
      `${payload.owner}/${payload.repo}`
    );
  }

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.ToolingUsage,
    owner: payload.owner,
    repo: payload.repo,
    output,
  };
};
