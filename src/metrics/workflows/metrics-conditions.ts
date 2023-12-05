import { collectWorkflowsMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { WorkflowsPayload } from "./interfaces";

export const isSignedAsWorkflowJob = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.WorkflowJob)) {
    return false;
  }

  if (dataEvent.payload.action !== "completed") {
    return false;
  }

  dataEvent.payload satisfies WorkflowsPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
