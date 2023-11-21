import { collectWorkflowsTestCoverageMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { TestCoveragePayload } from "./interfaces";

export const isSignedAsWorkflowJobTestCoverage = (
  dataEvent: SignedDataEvent
) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.WorkflowJob)) {
    return false;
  }

  if (dataEvent.payload.action !== "completed") {
    return false;
  }

  dataEvent.payload satisfies TestCoveragePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
