import { always, T } from "ramda";

import pullRequestsMetricsConditions from "./metrics/pull_requests/metricsConditions";

export default [...pullRequestsMetricsConditions, [T, always(false)]];
