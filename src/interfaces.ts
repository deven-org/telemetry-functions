import { CheckSuiteMetricsOutput } from "./metrics/check_suite/interfaces";
import { CodeReviewInvolvementOutput } from "./metrics/code_review_involvement/interfaces";
import { ReleaseVersionsOutput } from "./metrics/release_versions/interfaces";
import {
  ToolingUsageOutput,
  ToolingUsagePayload,
} from "./metrics/tooling_usage/interfaces";
import { WorkflowsOutput } from "./metrics/workflows/interfaces";
import { CommitsPerPrOutput } from "./metrics/commits_per_pr/interfaces";
import { WorkflowJobTestCoverageOutput } from "./metrics/test_coverage/interfaces";
import { DeploymentOutput } from "./metrics/deployments/interfaces";
import {
  PullRequestEvent,
  WorkflowJobEvent,
  CheckSuiteEvent,
  DeploymentEvent,
} from "@octokit/webhooks-types";
import { DocumentationUpdatedOutput } from "./metrics/documentation_updated/interfaces";

export enum DataEventSignature {
  WorkflowJob = "workflow-job",
  ToolingUsage = "deven-tooling-usage",
  PullRequest = "pull-request",
  CheckSuite = "check-suite",
  Deployment = "deployment",
  Unknown = "unknown",
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
  [DataEventSignature.Unknown]: unknown;
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
  eventSignature: string;
  action?: string;
}

export interface SignedDataEvent<
  T extends DataEventSignature = DataEventSignature
> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  created_at: number;
}

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
  status: "success" | "networkError";

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
