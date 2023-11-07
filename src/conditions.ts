import { Conditions, MetricsSignature } from "./interfaces.ts";
import { isSignedAsCheckSuiteCompleted } from "./metrics/check_suite/metricsConditions.ts";
import { isSignedAsCodeReviewInvolvement } from "./metrics/code_review_involvement/metricsConditions.ts";
import { isSignedAsCommitsPerPr } from "./metrics/commits_per_pr/metricsConditions.ts";
import { isSignedAsDeployment } from "./metrics/deployments/metricsConditions.ts";
import { isSignedAsReleaseVersion } from "./metrics/release_versions/metricsConditions.ts";
import { isSignedAsWorkflowJobTestCoverage } from "./metrics/test_coverage/metricsConditions.ts";
import { isSignedAsToolingUsage } from "./metrics/tooling_usage/metricsConditions.ts";
import { isSignedAsWorkflowJob } from "./metrics/workflows/metricsConditions.ts";

export const conditions: Conditions = [
  [MetricsSignature.ToolingUsage, isSignedAsToolingUsage],
  [MetricsSignature.WorkflowJob, isSignedAsWorkflowJob],
  [MetricsSignature.TestCoverage, isSignedAsWorkflowJobTestCoverage],
  [MetricsSignature.CodeReviewInvolvement, isSignedAsCodeReviewInvolvement],
  [MetricsSignature.CheckSuite, isSignedAsCheckSuiteCompleted],
  [MetricsSignature.ReleaseVersions, isSignedAsReleaseVersion],
  [MetricsSignature.CommitsPerPr, isSignedAsCommitsPerPr],
  [MetricsSignature.Deployment, isSignedAsDeployment],
];
