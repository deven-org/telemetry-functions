import {
  PullRquestClosedOutput,
  PullRquestClosedPayload,
} from "./metrics/code_review_involvement/interfaces";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling_usage/interfaces";

import {
  WorkflowJobCompletedOutput,
  WorkflowJobCompletedPayload,
} from "./metrics/workflows/interfaces";

export enum DataEventSignature {
  WorkflowJob = "workflow-job",
  ToolingUsage = "deven-tooling-usage",
  PullRequest = "pull-request",
}

interface DataEventPayloadMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobCompletedPayload;
  [DataEventSignature.ToolingUsage]: ToolingUsagePayload;
  [DataEventSignature.PullRequest]: PullRquestClosedPayload;
}

interface DataEventOutputMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobCompletedOutput;
  [DataEventSignature.ToolingUsage]: ToolingUsageOutput;
  [DataEventSignature.PullRequest]: PullRquestClosedOutput;
}

export type EnhancedDataEvent = Omit<DataEvent, "payload">;

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  created_at: number;
}

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  owner: string;
  repo: string;
  created_at: number;
}

export type Conditions = [
  (any) => boolean,
  (any) => EnhancedDataEvent | Promise<EnhancedDataEvent>
][];
