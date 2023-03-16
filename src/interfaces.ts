import {
  PullRequestClosedPayload,
  PullRequestClosedOutput,
} from "./metrics/pull_requests/interfaces";

import { WorkflowJobCompletedPayload } from "./metrics/workflows/interfaces";

export enum DataEventSignature {
  PullRequestClosed = "pull_request-completed",
  WorkflowJobCompleted = "workflow-job-completed",
}

interface DataEventPayloadMap {
  [DataEventSignature.PullRequestClosed]: PullRequestClosedPayload;
  [DataEventSignature.WorkflowJobCompleted]: WorkflowJobCompletedPayload;
}

interface DataEventOutputMap {
  [DataEventSignature.PullRequestClosed]: PullRequestClosedOutput;
  [DataEventSignature.WorkflowJobCompleted]: WorkflowJobCompletedPayload;
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
