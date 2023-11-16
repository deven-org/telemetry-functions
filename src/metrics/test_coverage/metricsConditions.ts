import { collectWorkflowsTestCoverageMetrics } from ".";
import { WorkflowJobCompletedEvent } from "../../github.interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

const isSignedAsWorkflowJobTestCoverage = (dataEvent: SignedDataEvent) => {
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
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
