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
import { Octokit } from "@octokit/rest";

export enum TriggerSource {
  Github = "github",
  Deven = "deven",
  Unknown = "unknown",
}

// These correspond to the actual event names we receive from GitHub!
export enum GithubEvent {
  WorkflowJob = "workflow_job",
  PullRequest = "pull_request",
  CheckSuite = "check_suite",
  Deployment = "deployment",
  TagOrBranchCreation = "create",
}

export enum DevenEvent {
  ToolingUsage = "tooling-usage",
}

/* eslint-disable @typescript-eslint/prefer-literal-enum-member
   --------
   There is no good alternative for checking that the enum members satisfy the
   pattern.
*/
export enum TriggerEventSignature {
  GithubWorkflowJob = `${TriggerSource.Github}::${GithubEvent.WorkflowJob}`,
  GithubPullRequest = `${TriggerSource.Github}::${GithubEvent.PullRequest}`,
  GithubCheckSuite = `${TriggerSource.Github}::${GithubEvent.CheckSuite}`,
  GithubDeployment = `${TriggerSource.Github}::${GithubEvent.Deployment}`,
  GithubTagOrBranchCreation = `${TriggerSource.Github}::${GithubEvent.TagOrBranchCreation}`,
  DevenToolingUsage = `${TriggerSource.Deven}::${DevenEvent.ToolingUsage}`,
}
// reenable rule
/* eslint-enable @typescript-eslint/prefer-literal-enum-member */

export enum MetricSignature {
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

interface TriggerEventPayloadMap {
  [TriggerEventSignature.GithubWorkflowJob]: WorkflowJobEvent;
  [TriggerEventSignature.DevenToolingUsage]: ToolingUsagePayload;
  [TriggerEventSignature.GithubPullRequest]: PullRequestEvent;
  [TriggerEventSignature.GithubCheckSuite]: CheckSuiteEvent;
  [TriggerEventSignature.GithubDeployment]: DeploymentEvent;
  [TriggerEventSignature.GithubTagOrBranchCreation]: CreateEvent;
}

interface MetricSignatureOutputMap {
  [MetricSignature.CheckSuite]: CheckSuiteMetricsOutput;
  [MetricSignature.CodeReviewInvolvement]: CodeReviewInvolvementOutput;
  [MetricSignature.CommitsPerPr]: CommitsPerPrOutput;
  [MetricSignature.Deployment]: DeploymentOutput;
  [MetricSignature.DocumentationUpdated]: DocumentationUpdatedOutput;
  [MetricSignature.ReleaseVersions]: ReleaseVersionsOutput;
  [MetricSignature.TestCoverage]: WorkflowJobTestCoverageOutput;
  [MetricSignature.ToolingUsage]: ToolingUsageOutput;
  [MetricSignature.WorkflowJob]: WorkflowsOutput;
}

export interface RawEvent {
  source: TriggerSource;
  sourceEventSignature: string;
  payload: unknown;
}

export interface SignedTriggerEvent<
  T extends TriggerEventSignature = TriggerEventSignature,
> {
  trigger_event_signature: T;
  payload: T extends keyof TriggerEventPayloadMap
    ? TriggerEventPayloadMap[T]
    : never;
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
  trigger_event_signature: TriggerEventSignature;

  /** The ID of the collected metric, as defined by the function */
  metric_signature: MetricSignature;

  /** The status of the metric collection, depending on the success of all related API calls */
  status: MetricDataStatus;

  /** The collected data for this metric */
  output: Output;
}

export interface MetricData<T extends MetricSignature = MetricSignature>
  extends MetricDataEnvelope<MetricSignatureOutputMap[T]> {
  metric_signature: T;
}

export type Conditions = [
  (event: SignedTriggerEvent) => boolean,
  (event: SignedTriggerEvent, repoClient?: Octokit) => Promise<MetricData>,
][];
