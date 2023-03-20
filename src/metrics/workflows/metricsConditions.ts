import { collectWorkflowsMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { WorkflowJobCompletedPayload } from "./interfaces";

const isSignedAsWorkflowJob = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.WorkflowJob) {
    return false;
  } else {
  }

  if (
    (dataEvent.payload as WorkflowJobCompletedPayload).action !== "completed"
  ) {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
