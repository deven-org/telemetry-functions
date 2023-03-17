import pullRequestsConditions from "./metrics/pull_requests/signatureConditions";
import toolingUsageConditions from "./metrics/tooling_usage/signatureConditions";

export default [...pullRequestsConditions, ...toolingUsageConditions];
