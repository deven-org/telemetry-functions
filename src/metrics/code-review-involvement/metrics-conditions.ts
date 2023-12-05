import { collectCodeReviewInvolvementMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { CodeReviewInvolvementPayload } from "./interfaces";

export const isSignedAsPullRequestClosed = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.PullRequest)) {
    return false;
  }

  if (dataEvent.payload.action !== "closed") {
    return false;
  }

  dataEvent.payload satisfies CodeReviewInvolvementPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectCodeReviewInvolvementMetrics],
];

export default conditions;
