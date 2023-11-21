import { collectCodeReviewInvolvementMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { validatePrWasMerged } from "../../shared/validatePrWasMerged";
import { CodeReviewInvolvementPayload } from "./interfaces";

export const isSignedAsPullRequestClosed = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.PullRequest)) {
    return false;
  }

  if (dataEvent.payload.action !== "closed") {
    return false;
  }

  // TODO: should merged but not-closed PRs also get recorded?
  // Would need adapting of the metric code!
  if (!validatePrWasMerged(dataEvent.payload)) {
    return false;
  }

  dataEvent.payload satisfies CodeReviewInvolvementPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectCodeReviewInvolvementMetrics],
];

export default conditions;
