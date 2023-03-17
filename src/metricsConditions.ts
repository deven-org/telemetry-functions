import pullRequestsMetricsConditions from "./metrics/pull_requests/metricsConditions";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";

export default [
  ...pullRequestsMetricsConditions,
  ...toolingUsageMetricsConditions,
];
