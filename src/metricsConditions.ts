import { Conditions } from "./interfaces";
import pullRequestsMetricsConditions from "./metrics/pull_requests/metricsConditions";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";

const conditions: Conditions = [
  ...pullRequestsMetricsConditions,
  ...toolingUsageMetricsConditions,
];
export default conditions;
