import { logger } from "../../core";
import { DataEvent, EnhancedDataEvent } from "../../interfaces";
import { PullRequestOutput, PullRequestPayload } from "./interfaces";
import { keys, pipe, mergeAll, includes } from "ramda";
import octokit from "../../core/octokit";
import { decode } from "js-base64";
import { LogWarnings } from "../../shared/logMessages";

export const collectPullRequestMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  const payload = dataEvent.payload as PullRequestPayload;

  let output: PullRequestOutput;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      {
        owner: owner,
        repo: repo,
        pull_number: payload.number,
      }
    );

    const { dependencies, devDependencies } = JSON.parse(
      decode(response.data["content"])
    );

    // const hasDocumentationSkeleton = pipe(
    //   keys,
    //   includes("deven-documentation-skeleton")
    // )(mergeAll([devDependencies, dependencies]));

    output = {
      // hasDocumentationSkeleton,
      // dependencies: dependencies,
      // devDependencies: devDependencies,
      owner: owner,
      repo: repo,
      // hasValidPackageJson: true,
      // hasDocChapters,
    };
  } catch (error) {
    output = {
      // hasDocumentationSkeleton: false,
      // dependencies: [],
      // devDependencies: [],
      // owner: payload.owner,
      // repo: payload.repo,
      // hasValidPackageJson: false,
      // hasDocChapters,
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

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    output,
    repo: payload.repo,
    owner: payload.owner,
  };
};
