import { DataEventSignature } from "./interfaces";
import { allPass, propEq } from "ramda";

export const isToolingUsed = allPass([
  propEq("eventSignature", "toolingUsage"),
]);
export const isWorkflowJob = allPass([
  propEq("eventSignature", "workflow_job"),
]);

export default [
  [isToolingUsed, DataEventSignature.ToolingUsage],
  [isWorkflowJob, DataEventSignature.WorkflowJob],
];
