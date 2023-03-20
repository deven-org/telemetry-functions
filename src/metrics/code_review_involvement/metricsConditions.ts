import { collectCodeReviewInvolvementMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { PullRquestClosedPayload } from "./interfaces";

const isSignedAsPullRequestClosed = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.PullRequest) {
    return false;
  } else {
  }

  if ((dataEvent.payload as PullRquestClosedPayload).action !== "closed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectCodeReviewInvolvementMetrics],
];

export default conditions;
