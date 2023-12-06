import { WebhookEventName } from "@octokit/webhooks-types";
import { TriggerEventSignature } from "../interfaces";

export function identifyGithubEventSignature(
  githubEvent: string
): TriggerEventSignature | null {
  // Careful, this type assertion is here to ensure our cases are sensible,
  // but at runtime the actual value might be something different we got sent.
  // So always include a default case.
  switch (githubEvent as WebhookEventName) {
    case "pull_request":
      return TriggerEventSignature.PullRequest;
    case "workflow_job":
      return TriggerEventSignature.WorkflowJob;
    case "create":
      return TriggerEventSignature.TagOrBranchCreation;
    case "check_suite":
      return TriggerEventSignature.CheckSuite;
    case "deployment":
      return TriggerEventSignature.Deployment;
    default:
      return null;
  }
}
