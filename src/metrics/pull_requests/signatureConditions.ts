import { allPass, propEq } from "ramda";
import { DataEventSignature } from "../../interfaces";

export const isPullRequestClosed = allPass([
  propEq("eventSignature", "pull_request"),
  propEq("action", "closed"),
]);

export default [[isPullRequestClosed, DataEventSignature.PullRequestClosed]];
