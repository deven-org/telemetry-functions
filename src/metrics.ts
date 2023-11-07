import { Metrics, MetricsSignature } from "./interfaces.ts";
import { collectToolingUsageMetrics } from "./metrics/tooling_usage/index.ts";
import { collectWorkflowsMetrics } from "./metrics/workflows/index.ts";
import { collectWorkflowsTestCoverageMetrics } from "./metrics/test_coverage/index.ts";
import { collectCodeReviewInvolvementMetrics } from "./metrics/code_review_involvement/index.ts";
import { collectCheckSuiteMetrics } from "./metrics/check_suite/index.ts";
import { collectReleaseVersionsMetrics } from "./metrics/release_versions/index.ts";
import { collectCommitsPerPrMetrics } from "./metrics/commits_per_pr/index.ts";
import { collectDeploymentMetrics } from "./metrics/deployments/index.ts";

export const metrics: Metrics = {
  [MetricsSignature.ToolingUsage]: collectToolingUsageMetrics,
  [MetricsSignature.WorkflowJob]: collectWorkflowsMetrics,
  [MetricsSignature.TestCoverage]: collectWorkflowsTestCoverageMetrics,
  [MetricsSignature.CodeReviewInvolvement]: collectCodeReviewInvolvementMetrics,
  [MetricsSignature.CheckSuite]: collectCheckSuiteMetrics,
  [MetricsSignature.ReleaseVersions]: collectReleaseVersionsMetrics,
  [MetricsSignature.CommitsPerPr]: collectCommitsPerPrMetrics,
  [MetricsSignature.Deployment]: collectDeploymentMetrics,
};
