import { logger } from "../../core";
import {
  DataEvent,
  EnhancedDataEvent,
  MetricsSignature,
} from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import { keys, pipe, mergeAll, includes } from "ramda";
import octokit from "../../core/octokit";
import { decode } from "js-base64";
import { LogWarnings } from "../../shared/logMessages";

export const collectToolingUsageMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as ToolingUsagePayload;

  let output: ToolingUsageOutput;
  let hasDocChapters = false;

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: payload.owner,
        repo: payload.repo,
        path: "package.json",
      }
    );
    const { dependencies, devDependencies } = JSON.parse(
      decode(response.data["content"])
    );

    const hasDocumentationSkeleton = pipe(
      keys,
      includes("deven-documentation-skeleton")
    )(mergeAll([devDependencies, dependencies]));

    output = {
      hasDocumentationSkeleton,
      dependencies: dependencies,
      devDependencies: devDependencies,
      owner: payload.owner,
      repo: payload.repo,
      hasValidPackageJson: true,
      hasDocChapters,
    };
  } catch (error) {
    output = {
      hasDocumentationSkeleton: false,
      dependencies: [],
      devDependencies: [],
      owner: payload.owner,
      repo: payload.repo,
      hasValidPackageJson: false,
      hasDocChapters,
    };
    logger.warn(
      LogWarnings.invalidPackageJson,
      `${payload.owner}/${payload.repo}`
    );
  }

  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: payload.owner,
      repo: payload.repo,
      path: "doc",
    }
  );

  if (response) {
    if (Array.isArray(response.data)) {
      hasDocChapters = response.data.length === 9;
    }
  }
  output.hasDocChapters = hasDocChapters;

  return {
    ...dataEvent,
    metricsSignature: MetricsSignature.ToolingUsage,
    output,
    repo: payload.repo,
    owner: payload.owner,
  };
};
