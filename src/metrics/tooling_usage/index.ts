import { logger } from "../../core";
import { DataEvent, EnhancedDataEvent } from "../../interfaces";
import { ToolingUsageOutput, ToolingUsagePayload } from "./interfaces";
import { keys, pipe, mergeAll, includes } from "ramda";
import octokit from "../../core/octokit";
import { encode, decode } from "js-base64";

export const collectToolingUsageMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as ToolingUsagePayload;

  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: payload.owner,
      repo: payload.repo,
      path: "package.json",
    }
  );

  console.log(response);

  const { dependencies, devDependencies } = JSON.parse(
    decode(response.data["content"])
  );

  const hasDocumentationSkeleton = pipe(
    keys,
    includes("deven-documentation-skeleton")
  )(mergeAll([devDependencies, dependencies]));

  const output: ToolingUsageOutput = {
    hasDocumentationSkeleton,
    dependencies: dependencies,
    devDependencies: devDependencies,
    owner: payload.owner,
    repo: payload.repo,
  };

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    output,
  };
};
