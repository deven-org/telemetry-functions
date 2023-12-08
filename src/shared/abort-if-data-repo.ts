import { ErrorForLogger } from "../core";
import { LogWarnings } from "./log-messages";

export function abortIfDataRepo(fullRepoName) {
  if (fullRepoName === `${process.env.REPO_OWNER}/${process.env.REPO_NAME}`) {
    throw new ErrorForLogger("skip", LogWarnings.repoIsDatabaseRepo);
  }
}
