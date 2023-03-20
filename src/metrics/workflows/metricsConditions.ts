import { collectWorkflowsMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsWorkflowJob = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.WorkflowJob) {
    return false;
  }

  if (dataEvent.payload.action !== "completed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
