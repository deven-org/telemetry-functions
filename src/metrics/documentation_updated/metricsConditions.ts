import { collectDocumentationUpdatedMetrics } from ".";
import { DocumentationUpdatedPayload } from "./interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { validatePrWasMerged } from "../../shared/validatePrWasMerged";

export const isSignedAsPullRequestMerged = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.PullRequest)) {
    return false;
  }

  if (dataEvent.payload.action !== "closed") {
    return false;
  }

  if (!validatePrWasMerged(dataEvent.payload)) {
    return false;
  }

  dataEvent.payload satisfies DocumentationUpdatedPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestMerged, collectDocumentationUpdatedMetrics],
];

export default conditions;
