import { collectDocumentationUpdatedMetrics } from ".";
import { DocumentationUpdatedPayload } from "./interfaces";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { validatePrWasMerged } from "../../shared/validate-pr-was-merged";
import { abortIfDataRepo } from "../../shared/abort-if-data-repo";

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

  abortIfDataRepo(triggerEvent.payload.repository.full_name);

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
