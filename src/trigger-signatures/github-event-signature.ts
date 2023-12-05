import { WebhookEventName } from "@octokit/webhooks-types";
import { DataEventSignature } from "../interfaces";

export function identifyGithubEventSignature(
  githubEvent: string
): DataEventSignature | null {
  // Careful, this type assertion is here to ensure our cases are sensible,
  // but at runtime the actual value might be something different we got sent.
  // So always include a default case.
  switch (githubEvent as WebhookEventName) {
    case "pull_request":
      return DataEventSignature.PullRequest;
    case "workflow_job":
      return DataEventSignature.WorkflowJob;
    case "create":
      return DataEventSignature.TagOrBranchCreation;
    case "check_suite":
      return DataEventSignature.CheckSuite;
    case "deployment":
      return DataEventSignature.Deployment;
    default:
      return null;
  }
}
