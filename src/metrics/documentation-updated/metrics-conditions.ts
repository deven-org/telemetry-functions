import { collectDocumentationUpdatedMetrics } from ".";
import { DocumentationUpdatedPayload } from "./interfaces";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { validatePrWasMerged } from "../../shared/validate-pr-was-merged";

export const isSignedAsPullRequestMerged = (
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

  if (triggerEvent.payload.action !== "closed") {
    return false;
  }

  if (!validatePrWasMerged(triggerEvent.payload)) {
    return false;
  }

  triggerEvent.payload satisfies DocumentationUpdatedPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestMerged, collectDocumentationUpdatedMetrics],
];

export default conditions;
