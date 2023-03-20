import { Conditions } from "./interfaces";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";
import worfklowsMetricsConditions from "./metrics/workflows/metricsConditions";
import codeReviewInvolvementMetricsConditions from "./metrics/code_review_involvement/metricsConditions";

const conditions: Conditions = [
  ...toolingUsageMetricsConditions,
  ...worfklowsMetricsConditions,
  ...codeReviewInvolvementMetricsConditions,
];
export default conditions;
