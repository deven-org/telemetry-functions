import { ErrorForLogger } from "../core/error-logger";
import { getRequiredEnvVar } from "./get-env-var";
import { LogWarnings } from "./log-messages";

export function abortIfDataRepo(fullRepoName) {
  const owner = getRequiredEnvVar("REPO_OWNER");
  const name = getRequiredEnvVar("REPO_NAME");

  if (fullRepoName === `${owner}/${name}`) {
    throw new ErrorForLogger("skip", LogWarnings.repoIsDatabaseRepo);
  }
}
