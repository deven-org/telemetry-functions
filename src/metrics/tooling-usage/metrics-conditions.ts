import { collectToolingUsageMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { abortIfDataRepo } from "../../shared/abort-if-data-repo";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { ToolingUsagePayload } from "./interfaces";

export const isSignedAsToolingUsage = (triggerEvent: SignedTriggerEvent) => {
  if (
    !validateEventSignature(
      triggerEvent,
      TriggerEventSignature.DevenToolingUsage
    )
  ) {
    return false;
  }

  abortIfDataRepo(`${triggerEvent.payload.owner}/${triggerEvent.payload.repo}`);

  triggerEvent.payload satisfies ToolingUsagePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsToolingUsage, collectToolingUsageMetrics],
];

export default conditions;
