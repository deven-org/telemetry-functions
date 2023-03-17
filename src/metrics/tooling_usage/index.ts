import { logger } from "../../core";
import { DataEvent, EnhancedDataEvent } from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import { keys, pipe, mergeAll, includes } from "ramda";
import octokit from "../../core/octokit";
import { encode, decode } from "js-base64";
import { invalid } from "moment";
import { LogWarnings } from "../../shared/logMessages";

export const collectToolingUsageMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as ToolingUsagePayload;

  let output: ToolingUsageOutput;
  let hasDocChapters;

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

  console.log(response.data);

  hasDocChapters = (response.data as any[]).length === 9;

  output.hasDocChapters = hasDocChapters;

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    output,
  };
};
