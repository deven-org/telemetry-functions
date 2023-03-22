import { collectWorkflowsTestCoverageMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { WorkflowJobTestCoveragePayload } from "./interfaces";

const isSignedAsWorkflowJobTestCoverage = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.TestCoverage) {
    return false;
  } else {
  }

  if (
    (dataEvent.payload as WorkflowJobTestCoveragePayload).action !== "completed"
  ) {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
