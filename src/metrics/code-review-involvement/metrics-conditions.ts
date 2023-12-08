import { collectCodeReviewInvolvementMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { abortIfDataRepo } from "../../shared/abort-if-data-repo";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { CodeReviewInvolvementPayload } from "./interfaces";

export const isSignedAsPullRequestClosed = (
  triggerEvent: SignedTriggerEvent
) => {
  if (
    !validateEventSignature(
      triggerEvent,
      TriggerEventSignature.GithubPullRequest
    )
  ) {
    return false;
  }

  abortIfDataRepo(triggerEvent.payload.repository.full_name);

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
