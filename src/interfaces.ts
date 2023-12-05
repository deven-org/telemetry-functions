import { CheckSuiteMetricsOutput } from "./metrics/check-suite/interfaces";
import { CodeReviewInvolvementOutput } from "./metrics/code-review-involvement/interfaces";
import { ReleaseVersionsOutput } from "./metrics/release-versions/interfaces";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling-usage/interfaces";
import { WorkflowsOutput } from "./metrics/workflows/interfaces";
import { CommitsPerPrOutput } from "./metrics/commits-per-pr/interfaces";
import { WorkflowJobTestCoverageOutput } from "./metrics/test-coverage/interfaces";
import { DeploymentOutput } from "./metrics/deployments/interfaces";
import {
  CreateEvent,
  PullRequestEvent,
  WorkflowJobEvent,
  CheckSuiteEvent,
  DeploymentEvent,
} from "@octokit/webhooks-types";
import { DocumentationUpdatedOutput } from "./metrics/documentation-updated/interfaces";

export enum TriggerSource {
  Github = "github",
  Deven = "deven",
  Unknown = "unknown",
}

export enum DataEventSignature {
  WorkflowJob = "workflow-job",
  ToolingUsage = "deven-tooling-usage",
  PullRequest = "pull-request",
  CheckSuite = "check-suite",
  Deployment = "deployment",
  TagOrBranchCreation = "create",
}

export enum MetricsSignature {
  CheckSuite = "check-suite",
  WorkflowJob = "workflow-job",
  TestCoverage = "test-coverage",
  CodeReviewInvolvement = "code-review-involvement",
  ToolingUsage = "tooling-usage",
  ReleaseVersions = "release-versions",
  CommitsPerPr = "commits-per-pr",
  Deployment = "deployment",
  DocumentationUpdated = "documentation-updated",
}

interface DataEventPayloadMap {
  [DataEventSignature.WorkflowJob]: WorkflowJobEvent;
  [DataEventSignature.ToolingUsage]: ToolingUsagePayload;
  [DataEventSignature.PullRequest]: PullRequestEvent;
  [DataEventSignature.CheckSuite]: CheckSuiteEvent;
  [DataEventSignature.Deployment]: DeploymentEvent;
  [DataEventSignature.TagOrBranchCreation]: CreateEvent;
}

interface MetricsSignatureOutputMap {
  [MetricsSignature.CheckSuite]: CheckSuiteMetricsOutput;
  [MetricsSignature.CodeReviewInvolvement]: CodeReviewInvolvementOutput;
  [MetricsSignature.CommitsPerPr]: CommitsPerPrOutput;
  [MetricsSignature.Deployment]: DeploymentOutput;
  [MetricsSignature.DocumentationUpdated]: DocumentationUpdatedOutput;
  [MetricsSignature.ReleaseVersions]: ReleaseVersionsOutput;
  [MetricsSignature.TestCoverage]: WorkflowJobTestCoverageOutput;
  [MetricsSignature.ToolingUsage]: ToolingUsageOutput;
  [MetricsSignature.WorkflowJob]: WorkflowsOutput;
}

export interface RawEvent {
  source: TriggerSource;
  sourceEventSignature: string;
  payload: unknown;
}

export interface SignedDataEvent<
  T extends DataEventSignature = DataEventSignature
> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  created_at: number;
}

export type MetricDataStatus = "success" | "networkError";

export interface MetricDataEnvelope<Output extends object> {
  /** Time that the server started processing the event (UNIX ms) */
  created_at: number;

  /** The GitHub organisation / account that owns the source repo */
  owner: string;

  /** The GitHub repository name */
  repo: string;

  /** The ID of the triggering data-source, e.g. a GitHub event name */
  dataEventSignature: DataEventSignature;

  /** The ID of the collected metric, as defined by the function */
  metricsSignature: MetricsSignature;

  /** The status of the metric collection, depending on the success of all related API calls */
  status: MetricDataStatus;

  /** The collected data for this metric */
  output: Output;
}

export interface MetricData<T extends MetricsSignature = MetricsSignature>
  extends MetricDataEnvelope<MetricsSignatureOutputMap[T]> {
  metricsSignature: T;
}

export type Conditions = [
  (event: SignedDataEvent) => boolean,
  (event: SignedDataEvent) => Promise<MetricData>
][];
