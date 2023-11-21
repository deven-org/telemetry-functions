import { PullRequestClosedEvent } from "@octokit/webhooks-types";
import { MergedPullRequestClosedEvent } from "../github.interfaces";

export function validatePrWasMerged(
  payload: PullRequestClosedEvent
): payload is MergedPullRequestClosedEvent {
  return payload.pull_request.merged;
}
