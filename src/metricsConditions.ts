import { Conditions } from "./interfaces";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";
import worfklowsMetricsConditions from "./metrics/workflows/metricsConditions";
import testCoverageMetricsConditions from "./metrics/test_coverage/metricsConditions"
import codeReviewInvolvementMetricsConditions from "./metrics/code_review_involvement/metricsConditions";
import checkSuiteMetricsConditions from "./metrics/check_suite/metricsConditions";
import releaseVersionsMetricsConditions from "./metrics/release_versions/metricsConditions";
import commitsPerPrMetricsConditions from "./metrics/commits_per_pr/metricsConditions";

const conditions: Conditions = [
  ...toolingUsageMetricsConditions,
  ...worfklowsMetricsConditions,
  ...testCoverageMetricsConditions,
  ...codeReviewInvolvementMetricsConditions,
  ...checkSuiteMetricsConditions,
  ...releaseVersionsMetricsConditions,
  ...commitsPerPrMetricsConditions,
];

export default conditions;
