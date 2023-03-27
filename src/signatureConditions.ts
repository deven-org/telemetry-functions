import { DataEventSignature } from "./interfaces";
import { allPass, propEq } from "ramda";

export const isToolingUsed = allPass([
  propEq("toolingUsage", "eventSignature"),
]);

export const isWorkflowJob = allPass([
  propEq("workflow_job", "eventSignature"),
]);

export const isPullRequest = allPass([
  propEq("pull_request", "eventSignature"),
]);

export const isCheckSuite = allPass([propEq("check_suite", "eventSignature")]);

export const isDeployment = allPass([propEq("eventSignature", "deployment")]);

export default [
  [isToolingUsed, DataEventSignature.ToolingUsage],
  [isWorkflowJob, DataEventSignature.WorkflowJob],
  [isPullRequest, DataEventSignature.PullRequest],
  [isCheckSuite, DataEventSignature.CheckSuite],
  [isDeployment, DataEventSignature.Deployment],
];
