import { collectCodeReviewInvolvementMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { CodeReviewInvolvementPayload } from "./interfaces";

export const isSignedAsPullRequestClosed = (
  triggerEvent: SignedTriggerEvent
) => {
  if (
    !validateEventSignature(triggerEvent, TriggerEventSignature.PullRequest)
  ) {
    return false;
  }

  if (triggerEvent.payload.action !== "closed") {
    return false;
  }

  triggerEvent.payload satisfies CodeReviewInvolvementPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectCodeReviewInvolvementMetrics],
];

export default conditions;
