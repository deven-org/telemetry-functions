import { CheckSuiteEvent, PullRequestClosedEvent } from "./github.interfaces";
import { CheckSuiteMetricsOutput } from "./metrics/check_suite/interfaces";
import { PullRequestClosedOutput } from "./metrics/code_review_involvement/interfaces";
import { ReleaseVersionsOutput } from "./metrics/release_versions/interfaces";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling_usage/interfaces";

import {
  WorkflowJobCompletedOutput,
  WorkflowJobCompletedPayload,
} from "./metrics/workflows/interfaces";

import { CommitsPerPrOutput } from "./metrics/commits_per_pr/interfaces";

export enum DataEventSignature {
  WorkflowJob = "workflow-job",
  ToolingUsage = "deven-tooling-usage",
  PullRequest = "pull-request",
  CheckSuite = "check-suite",
}

export enum MetricsSignature {
  CheckSuite = "check-suite",
  WorkflowJob = "workflow-job",
  CodeReviewInvolvement = "code-review-involvement",
  ToolingUsage = "tooling-usage",
  ReleaseVersions = "release-versions",
  CommitsPerPr = "CommitsPerPr",
}

interface DataEventPayloadMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobCompletedPayload;
  [DataEventSignature.ToolingUsage]: ToolingUsagePayload;
  [DataEventSignature.PullRequest]: PullRequestClosedEvent;
  [DataEventSignature.CheckSuite]: CheckSuiteEvent;
}

interface DataEventOutputMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobCompletedOutput;
  [DataEventSignature.ToolingUsage]: ToolingUsageOutput;
  [DataEventSignature.PullRequest]:
    | PullRequestClosedOutput
    | ReleaseVersionsOutput
    | CommitsPerPrOutput;
  [DataEventSignature.CheckSuite]: CheckSuiteMetricsOutput;
}

export type EnhancedDataEvent = Omit<DataEvent, "payload">;

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  metricsSignature?: MetricsSignature;
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
  (any) => DataEvent | EnhancedDataEvent | Promise<EnhancedDataEvent>
][];
