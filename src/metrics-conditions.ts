import { Conditions } from "./interfaces";
import toolingUsageMetricsConditions from "./metrics/tooling-usage/metrics-conditions";
import worfklowsMetricsConditions from "./metrics/workflows/metrics-conditions";
import testCoverageMetricsConditions from "./metrics/test-coverage/metrics-conditions";
import codeReviewInvolvementMetricsConditions from "./metrics/code-review-involvement/metrics-conditions";
import checkSuiteMetricsConditions from "./metrics/check-suite/metrics-conditions";
import releaseVersionsMetricsConditions from "./metrics/release-versions/metrics-conditions";
import commitsPerPrMetricsConditions from "./metrics/commits-per-pr/metrics-conditions";
import deploymentMetricsConditions from "./metrics/deployments/metrics-conditions";
import documentationUpdatedMetricsConditions from "./metrics/documentation-updated/metrics-conditions";

const conditions: Conditions = [
  ...toolingUsageMetricsConditions,
  ...worfklowsMetricsConditions,
  ...testCoverageMetricsConditions,
  ...codeReviewInvolvementMetricsConditions,
  ...checkSuiteMetricsConditions,
  ...releaseVersionsMetricsConditions,
  ...commitsPerPrMetricsConditions,
  ...deploymentMetricsConditions,
  ...documentationUpdatedMetricsConditions,
];

export default conditions;
