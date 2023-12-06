import { collectCheckSuiteMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { CheckSuitePayload } from "./interfaces";

export const isSignedAsCheckSuiteCompleted = (
  triggerEvent: SignedTriggerEvent
) => {
  if (!validateEventSignature(triggerEvent, TriggerEventSignature.CheckSuite)) {
    return false;
  }

  if (triggerEvent.payload.action !== "completed") {
    return false;
  }

  triggerEvent.payload satisfies CheckSuitePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsCheckSuiteCompleted, collectCheckSuiteMetrics],
];

export default conditions;
