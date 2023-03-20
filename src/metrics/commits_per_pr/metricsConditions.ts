import { collectPullRequestMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsPullRequest = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.PullRequest;

const conditions: Conditions = [
  [isSignedAsPullRequest, collectPullRequestMetrics],
];

export default conditions;
