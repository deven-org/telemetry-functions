import { MetricData } from "../interfaces";
import { octokitForDataRepo } from "./octokit";
import { ErrorForLogger } from "./error-logger";
import { LogErrors, LogInfos, LogWarnings } from "../shared/log-messages";
import {
  getOptionalEnvVar,
  getOptionalNumericEnvVar,
  getRequiredEnvVar,
} from "../shared/get-env-var";
import { logger } from "./logger";

export class StoreDataError extends ErrorForLogger {
  name = "StoreDataError";

  static noReadAccess(status: number): StoreDataError {
    return new StoreDataError(
      "error",
      LogErrors.dataRepoNoReadAccess,
      status.toString()
    );
  }

  static noWriteAccess(status: number): StoreDataError {
    return new StoreDataError(
      "error",
      LogErrors.dataRepoNoWriteAccess,
      status.toString()
    );
  }
}

async function getHeadShas(
  owner: string,
  repo: string,
  branch: string
): Promise<{ commitSha: string; treeSha: string }> {
  const {
    data: [latestCommit],
  } = await octokitForDataRepo.request("GET /repos/{owner}/{repo}/commits", {
    owner,
    repo,
    sha: branch,
    per_page: 1,
  });

  return {
    commitSha: latestCommit.sha,
    treeSha: latestCommit.commit.tree.sha,
  };
}

export const storeData = async (metricData: MetricData[]) => {
  if (metricData.length === 0) {
    // this is just a bug in our code and doesn't get a message in LogErrors
    throw new Error("storeData must be called with at least one dataset");
  }

  const dataRepoOwner = getRequiredEnvVar("REPO_OWNER");
  const dataRepo = getRequiredEnvVar("REPO_NAME");
  const dataRepoPath = getRequiredEnvVar("REPO_PATH");
  const dataRepoTargetBranch = getRequiredEnvVar("TARGET_BRANCH");

  const retriesAllowed = getOptionalNumericEnvVar("CONFLICT_RETRIES") ?? 0;

  // Build the tree of added files from the metric data
  const fileTree = metricData.map((data) => ({
    path: `${dataRepoPath}/${data.owner}/${data.repo}/${data.metric_signature}/${data.created_at}.json`,
    mode: "100644" as const,
    // UTF-8 encoded plaintext files can be sent as a plain string.
    content: `${JSON.stringify(data)}\n`,
  }));

  let headShas: { commitSha: string; treeSha: string };

  /*
    [Step 1/4]
    
    Retrieve current head commit SHA of branch.

    Since this is the first read from the repo, we'll throw a custom error
    warning about the token not having read access in case the request fails.
  */
  try {
    headShas = await getHeadShas(dataRepoOwner, dataRepo, dataRepoTargetBranch);
  } catch (e: unknown) {
    if (e instanceof Error && "status" in e && typeof e.status === "number") {
      throw StoreDataError.noReadAccess(e.status);
    } else {
      throw e;
    }
  }

  // Note: the actual exit condition for a retry is a bit more complex than just
  // this check, see the last request inside the for loop where the code either
  // throws an error, breaks the loop, or advances it.
  for (let tryNumber = 0; tryNumber <= retriesAllowed; tryNumber++) {
    /*
      [Step 2/4]
      
      Post the git tree object to GitHub, so we can reference it inside a new
      commit. It uses the current HEAD's tree as the base tree.

      Since this is the first write to the repo, we'll throw a custom error
      warning about the token not having write access in case the request fails.
    */
    const {
      data: { sha: newTreeSha },
    } = await octokitForDataRepo
      .request("POST /repos/{owner}/{repo}/git/trees", {
        owner: dataRepoOwner,
        repo: dataRepo,
        base_tree: headShas.treeSha,
        tree: fileTree,
      })
      .catch((e: unknown) => {
        if (
          e instanceof Error &&
          "status" in e &&
          typeof e.status === "number"
        ) {
          throw StoreDataError.noWriteAccess(e.status);
        } else {
          throw e;
        }
      });

    // ASSUMPTION:
    // All metricData events have the same trigger_event_signature, owner, and repo!
    // If this changes, we'll likely just want to drop this info from the commit
    // message.
    const {
      trigger_event_signature: commitMessageTrigger,
      owner: triggerOwner,
      repo: triggerRepo,
    } = metricData[0];

    const authorName = getOptionalEnvVar("AUTHOR_NAME");
    const authorEmail = getOptionalEnvVar("AUTHOR_EMAIL");
    const author =
      authorName && authorEmail
        ? {
            name: authorName,
            email: authorEmail,
          }
        : undefined;

    const committerName = getOptionalEnvVar("COMMITTER_NAME");
    const committerEmail = getOptionalEnvVar("COMMITTER_EMAIL");
    const committer =
      committerName && committerEmail
        ? {
            name: committerName,
            email: committerEmail,
          }
        : undefined;

    /*
      [Step 3/4]
      
      Post a new git commit object to GitHub.
      The author and committer may be undefined.
      The parent commit is set to the current branch HEAD.
      The tree is our newly created tree with all the file contents.
    */
    const {
      data: { sha: newCommitSha },
    } = await octokitForDataRepo.request(
      "POST /repos/{owner}/{repo}/git/commits",
      {
        owner: dataRepoOwner,
        repo: dataRepo,
        message: `auto(data): add metrics from ${commitMessageTrigger} for ${triggerOwner}/${triggerRepo}`,
        author,
        committer,
        parents: [headShas.commitSha],
        tree: newTreeSha,
      }
    );

    /*
      [Step 4/4]
      
      Set the target branch to our newly created ref.
      `force` is set to false, so we do not overwrite another commit that may
      have been committed in the meantime (equivalent to not force-pushing).

      If there is a newer commit by now, we try to fetch the new commit SHAs and
      do evertyhing again. If there isn't, or if we're out of retries, we just
      throw the error.
      Note that there is no way to remove the now unused objects on GitHub, but
      they will probably expire at some point.
    */
    try {
      await octokitForDataRepo.request(
        "PATCH /repos/{owner}/{repo}/git/refs/{ref}",
        {
          owner: dataRepoOwner,
          repo: dataRepo,
          ref: `heads/${dataRepoTargetBranch}`,
          sha: newCommitSha,
          force: false,
        }
      );
    } catch (e: unknown) {
      if (tryNumber === retriesAllowed) {
        logger.warn(
          LogWarnings.storeDataConflictRetriesMaximumReached,
          retriesAllowed.toString(10)
        );
        // out of retries, just throw the error
        throw e;
      }

      logger.info(LogInfos.storeDataCheckingHead);
      // Check if we should retry due to a changed HEAD
      const newHeadShas = await getHeadShas(
        dataRepoOwner,
        dataRepo,
        dataRepoTargetBranch
      );
      if (newHeadShas.commitSha === headShas.commitSha) {
        logger.warn(LogWarnings.storeDataNotAConflict);
        // nothing changed, error has a different cause
        throw e;
      }

      // Let's go for another round 🎠
      headShas = newHeadShas;
      logger.info(LogInfos.storeDataRetrying);
      continue;
    }

    // Exit the loop after a successful commit!
    break;
  }

  return metricData;
};
