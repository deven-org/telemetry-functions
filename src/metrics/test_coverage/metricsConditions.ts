import { collectWorkflowsTestCoverageMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { WorkflowJobCompletedPayload } from "../workflows/interfaces";

const isSignedAsWorkflowJobTestCoverage = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.TestCoverage) {
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
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
