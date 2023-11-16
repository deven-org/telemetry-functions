import { collectReleaseVersionsMetrics } from ".";
import { PullRequestClosedEvent } from "../../github.interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

const isSignedAsPullRequestClosed = (dataEvent: SignedDataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.PullRequest) {
    return false;
  } else {
  }

  if ((dataEvent.payload as PullRequestClosedEvent).action !== "closed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectReleaseVersionsMetrics],
];

export default conditions;
