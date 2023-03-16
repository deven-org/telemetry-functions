import {
  PullRequestClosedPayload,
  PullRequestClosedOutput,
} from "./metrics/pull_requests/interfaces";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling_usage/interfaces";

import {
  WorkflowJobCompletedOutput,
  WorkflowJobCompletedPayload,
} from "./metrics/workflows/interfaces";

export enum DataEventSignature {
  PullRequestClosed = "pull_request-completed",
  WorkflowJobCompleted = "workflow-job-completed",
  ToolingUsage = "deven-tooling-usage",
}

interface DataEventPayloadMap {
  [DataEventSignature.PullRequestClosed]: PullRequestClosedPayload;
  [DataEventSignature.WorkflowJobCompleted]: WorkflowJobCompletedPayload;
  [DataEventSignature.ToolingUsage]: ToolingUsagePayload;
}

interface DataEventOutputMap {
  [DataEventSignature.PullRequestClosed]: PullRequestClosedOutput;
  [DataEventSignature.WorkflowJobCompleted]: WorkflowJobCompletedOutput;
  [DataEventSignature.ToolingUsage]: ToolingUsageOutput;
}

export type EnhancedDataEvent = Omit<DataEvent, "payload">;

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  created_at: Number;
}

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  created_at: Number;
}
