import { collectWorkflowsMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { WorkflowsPayload } from "./interfaces";

export const isSignedAsWorkflowJob = (triggerEvent: SignedTriggerEvent) => {
  if (
    !validateEventSignature(triggerEvent, TriggerEventSignature.WorkflowJob)
  ) {
    return false;
  }

  if (triggerEvent.payload.action !== "completed") {
    return false;
  }

  triggerEvent.payload satisfies WorkflowsPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
