import {
  CheckSuiteEvent,
  PullRequestClosedEvent,
  DeploymentCreatedEvent,
  WorkflowJobCompletedEvent,
} from "./github.interfaces.ts";
import { CheckSuiteMetricsOutput } from "./metrics/check_suite/interfaces.d.ts";
import { CodeReviewInvolvementOutput } from "./metrics/code_review_involvement/interfaces.d.ts";
import { ReleaseVersionsOutput } from "./metrics/release_versions/interfaces.d.ts";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling_usage/interfaces.d.ts";

import { WorkflowJobCompletedOutput } from "./metrics/workflows/interfaces.d.ts";

import { CommitsPerPrOutput } from "./metrics/commits_per_pr/interfaces.d.ts";
import { WorkflowJobTestCoverageOutput } from "./metrics/test_coverage/interfaces.d.ts";
import { DeploymentOutput } from "./metrics/deployments/interfaces.d.ts";

export enum DataEventSignature {
  WorkflowJob = "workflow-job",
  ToolingUsage = "deven-tooling-usage",
  PullRequest = "pull-request",
  CheckSuite = "check-suite",
  Deployment = "deployment",
}

export type Conditions = [MetricsSignature, (any) => boolean][];

export enum MetricsSignature {
  CheckSuite = "check-suite",
  WorkflowJob = "workflow-job",
  TestCoverage = "test-coverage",
  CodeReviewInvolvement = "code-review-involvement",
  ToolingUsage = "tooling-usage",
  ReleaseVersions = "release-versions",
  CommitsPerPr = "commits-per-pr",
  Deployment = "deployment",
}

export type Metrics = Record<
  MetricsSignature,
  (event: DataEvent) => Promise<MetricData>
>;

export interface RawEvent {
  eventSignature: string;
  action?: string;
}

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  created_at: number;
}

export interface CheckedMetricsDataEvent<
  T extends DataEventSignature = DataEventSignature
> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  created_at: number;
  metricsToApply: MetricsSignature[];
}

export interface MetricData<T extends MetricsSignature = MetricsSignature> {
  dataEventSignature: DataEventSignature;
  output: T extends keyof MetricsSignatureOutputMap
    ? MetricsSignatureOutputMap[T]
    : never;
  owner: string;
  repo: string;
  created_at: number;
  metricsSignature: T;
}

export interface DataEventPayloadMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobCompletedEvent;
  [DataEventSignature.ToolingUsage]: ToolingUsagePayload;
  [DataEventSignature.PullRequest]: PullRequestClosedEvent;
  [DataEventSignature.CheckSuite]: CheckSuiteEvent;
  [DataEventSignature.Deployment]: DeploymentCreatedEvent;
}

interface MetricsSignatureOutputMap {
  [MetricsSignature.CheckSuite]: CheckSuiteMetricsOutput;
  [MetricsSignature.CodeReviewInvolvement]: CodeReviewInvolvementOutput;
  [MetricsSignature.CommitsPerPr]: CommitsPerPrOutput;
  [MetricsSignature.Deployment]: DeploymentOutput;
  [MetricsSignature.ReleaseVersions]: ReleaseVersionsOutput;
  [MetricsSignature.TestCoverage]: WorkflowJobTestCoverageOutput;
  [MetricsSignature.ToolingUsage]: ToolingUsageOutput;
  [MetricsSignature.WorkflowJob]: WorkflowJobCompletedOutput;
}
