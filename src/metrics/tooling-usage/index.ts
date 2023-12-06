import { logger } from "../../core";
import {
  SignedTriggerEvent,
  MetricData,
  MetricsSignature,
  MetricDataStatus,
} from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import octokit from "../../core/octokit";
import { decode } from "js-base64";
import { LogWarnings } from "../../shared/log-messages";

export const collectToolingUsageMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricsSignature.ToolingUsage>> => {
  const payload = triggerEvent.payload as ToolingUsagePayload;

  let status: MetricDataStatus = "success";
  const output: ToolingUsageOutput = {
    documentationSkeletonConfig: null,
  };

  const configResponse = await octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: payload.owner,
      repo: payload.repo,
      path: "deven-skeleton-install.config.json",
    })
    .catch((e: unknown) => {
      if (e && typeof e == "object" && "status" in e && e.status === 404) {
        logger.warn(
          LogWarnings.documentationSkeletonConfigNotFound,
          `${payload.owner}/${payload.repo}`
        );
        return "missing";
      }

      status = "networkError";
      logger.error(e);
      return null;
    });

  if (configResponse === "missing") {
    output.documentationSkeletonConfig = {
      exists: false,
      parsable: null,
      version: null,
    };
  } else if (configResponse !== null) {
    let parsedConfig: unknown;

    try {
      parsedConfig = JSON.parse(decode(configResponse.data["content"]));
    } catch (e) {
      parsedConfig = null;
    }

    if (
      parsedConfig === null ||
      typeof parsedConfig !== "object" ||
      Array.isArray(parsedConfig)
    ) {
      output.documentationSkeletonConfig = {
        exists: true,
        parsable: false,
        version: null,
      };
    } else {
      const version = "version" in parsedConfig ? parsedConfig.version : null;
      if (typeof version !== "string") {
        output.documentationSkeletonConfig = {
          exists: true,
          parsable: true,
          version: null,
        };
      } else {
        output.documentationSkeletonConfig = {
          exists: true,
          parsable: true,
          version,
        };
      }
    }
  }

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metricsSignature: MetricsSignature.ToolingUsage,
    owner: payload.owner,
    repo: payload.repo,
    status,
    output,
  };
};
