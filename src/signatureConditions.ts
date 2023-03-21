import { DataEventSignature } from "./interfaces";
import { allPass, propEq } from "ramda";

export const isToolingUsed = allPass([
  propEq("eventSignature", "toolingUsage"),
]);
export const isWorkflowJob = allPass([
  propEq("eventSignature", "workflow_job"),
]);

export const isPullRequest = allPass([
  propEq("eventSignature", "pull_request"),
]);

export const isCheckSuite = allPass([propEq("eventSignature", "check_suite")]);

export default [
  [isToolingUsed, DataEventSignature.ToolingUsage],
  [isWorkflowJob, DataEventSignature.WorkflowJob],
  [isPullRequest, DataEventSignature.PullRequest],
  [isCheckSuite, DataEventSignature.CheckSuite],
];
