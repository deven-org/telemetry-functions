import { Conditions } from "./interfaces";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";
import worfklowsMetricsConditions from "./metrics/workflows/metricsConditions";
import codeReviewInvolvementMetricsConditions from "./metrics/code_review_involvement/metricsConditions";
import checkSuiteMetricsConditions from "./metrics/check_suite/metricsConditions";
import releaseVersionsMetricsConditions from "./metrics/release_versions/metricsConditions";

const conditions: Conditions = [
  ...toolingUsageMetricsConditions,
  ...worfklowsMetricsConditions,
  ...codeReviewInvolvementMetricsConditions,
  ...checkSuiteMetricsConditions,
  ...releaseVersionsMetricsConditions,
];
export default conditions;
