import { collectToolingUsageMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
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

  triggerEvent.payload satisfies ToolingUsagePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsToolingUsage, collectToolingUsageMetrics],
];

export default conditions;
