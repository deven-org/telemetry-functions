import { collectCommitsPerPrMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { PullRequestClosedEvent } from "./../../github.interfaces";

const isSignedAsCommitsPerPr = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.PullRequest) {
    return false;
  }

  if ((dataEvent.payload as PullRequestClosedEvent).action !== "closed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsCommitsPerPr, collectCommitsPerPrMetrics],
];

export default conditions;
