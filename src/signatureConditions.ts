import { always, T } from "ramda";

import pullRequestsConditions from "./metrics/pull_requests/signatureConditions";
import toolingUsageConditions from "./metrics/tooling_usage/signatureConditions";

export default [...pullRequestsConditions, ...toolingUsageConditions];
