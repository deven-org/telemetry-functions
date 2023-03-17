import { collectPullRequestCompleteMetrics } from ".";
import { DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsPullRequestClosed = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.PullRequestClosed;

export default [
  [isSignedAsPullRequestClosed, collectPullRequestCompleteMetrics],
];
