import { always, T } from "ramda";

import pullRequestsConditions from "./metrics/pull_requests/signatureConditions";

export default [...pullRequestsConditions, [T, always(false)]];
