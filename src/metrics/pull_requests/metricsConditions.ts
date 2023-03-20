import { collectPullRequestCompleteMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsPullRequestClosed = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.PullRequestClosed;

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectPullRequestCompleteMetrics],
];
export default conditions;
