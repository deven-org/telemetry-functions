import { WorkflowJobCompletedEvent } from "../../github.interfaces.ts";
import { DataEvent, DataEventSignature } from "../../interfaces.ts";

export const isSignedAsWorkflowJob = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.WorkflowJob) {
    return false;
  } else {
  }

  if ((dataEvent.payload as WorkflowJobCompletedEvent).action !== "completed") {
    return false;
  }

  return true;
};
