import { logger } from "../../core";
import {
  SignedTriggerEvent,
  MetricData,
  MetricSignature,
  MetricDataStatus,
} from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import octokit from "../../core/octokit";
import { LogErrors, LogWarnings } from "../../shared/log-messages";
import { octokitJsonResponseHandler } from "../../shared/octokit-json-response-handler";

export const collectToolingUsageMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.ToolingUsage>> => {
  const { owner, repo } = triggerEvent.payload as ToolingUsagePayload;

  let status: MetricDataStatus = "success";
  const output: ToolingUsageOutput = {
    documentation_skeleton_config: null,
  };

  const configResponse = await octokitJsonResponseHandler(
    octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: "deven-skeleton-install.config.json",
    })
  );

  switch (configResponse.variant) {
    case "unexpected-error":
      status = "networkError";
      logger.error(
        LogErrors.networkErrorDocumentationSkeletonConfig,
        `${owner}/${repo}`
      );
      output.documentation_skeleton_config = null;
      break;
    case "missing":
      logger.warn(
        LogWarnings.documentationSkeletonConfigNotFound,
        `${owner}/${repo}`
      );
      output.documentation_skeleton_config = {
        exists: false,
        parsable: null,
        version: null,
      };
      break;
    case "unparsable":
      logger.warn(
        LogWarnings.documentationSkeletonConfigNotParsable,
        `${owner}/${repo}`
      );
      output.documentation_skeleton_config = {
        exists: true,
        parsable: false,
        version: null,
      };
      break;
    case "parsable":
    default:
      // ^ TS will error if there is a new variant that has different content
      if (typeof configResponse.content.version !== "string") {
        logger.warn(
          LogWarnings.documentationSkeletonConfigNonStringVersion,
          `${owner}/${repo}`
        );
        output.documentation_skeleton_config = {
          exists: true,
          parsable: true,
          version: null,
        };
      } else {
        output.documentation_skeleton_config = {
          exists: true,
          parsable: true,
          version: configResponse.content.version,
        };
      }
  }

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.ToolingUsage,
    owner,
    repo,
    status,
    output,
  };
};
