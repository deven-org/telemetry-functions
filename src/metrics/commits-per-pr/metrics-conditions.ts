import { collectCommitsPerPrMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { abortIfDataRepo } from "../../shared/abort-if-data-repo";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { validatePrWasMerged } from "../../shared/validate-pr-was-merged";
import { CommitsPerPrPayload } from "./interfaces";

export const isSignedAsCommitsPerPr = (triggerEvent: SignedTriggerEvent) => {
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

  triggerEvent.payload satisfies CommitsPerPrPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsCommitsPerPr, collectCommitsPerPrMetrics],
];

export default conditions;
