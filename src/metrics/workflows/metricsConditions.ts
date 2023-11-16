import { collectWorkflowsMetrics } from ".";
import { WorkflowJobCompletedEvent } from "../../github.interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

const isSignedAsWorkflowJob = (dataEvent: SignedDataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.WorkflowJob) {
    return false;
  } else {
  }

  if ((dataEvent.payload as WorkflowJobCompletedEvent).action !== "completed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
