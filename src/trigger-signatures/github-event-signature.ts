import { WebhookEventName } from "@octokit/webhooks-types";
import { GithubEvent, TriggerEventSignature } from "../interfaces";

export function identifyGithubEventSignature(
  githubEvent: string
): TriggerEventSignature | null {
  // Careful, this type assertion is here to ensure our cases are sensible,
  // but at runtime the actual value might be something different we got sent.
  // So always include a default case.
  switch (githubEvent as WebhookEventName) {
    case GithubEvent.PullRequest:
      return TriggerEventSignature.GithubPullRequest;
    case GithubEvent.WorkflowJob:
      return TriggerEventSignature.GithubWorkflowJob;
    case GithubEvent.TagOrBranchCreation:
      return TriggerEventSignature.GithubTagOrBranchCreation;
    case GithubEvent.CheckSuite:
      return TriggerEventSignature.GithubCheckSuite;
    case GithubEvent.Deployment:
      return TriggerEventSignature.GithubDeployment;
    default:
      return null;
  }
}
