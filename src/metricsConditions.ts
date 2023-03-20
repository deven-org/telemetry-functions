import { Conditions } from "./interfaces";
import toolingUsageMetricsConditions from "./metrics/tooling_usage/metricsConditions";
import worfklowsMetricsConditions from "./metrics/workflows/metricsConditions";

const conditions: Conditions = [
  ...toolingUsageMetricsConditions,
  ...worfklowsMetricsConditions,
];
export default conditions;
