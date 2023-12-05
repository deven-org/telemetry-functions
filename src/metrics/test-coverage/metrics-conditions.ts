import { collectWorkflowsTestCoverageMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { TestCoveragePayload } from "./interfaces";
import { isNameAboutTest } from "./is-name-about-test";

export const isSignedAsWorkflowJobTestCoverage = (
  dataEvent: SignedDataEvent
) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.WorkflowJob)) {
    return false;
  }

  if (dataEvent.payload.action !== "completed") {
    return false;
  }

  const isAboutTests = [
    dataEvent.payload.workflow_job.name,
    dataEvent.payload.workflow_job.workflow_name,
    ...dataEvent.payload.workflow_job.steps.map((step) => step.name),
  ]
    .filter((name): name is string => name !== null)
    .some((name) => isNameAboutTest(name));

  if (!isAboutTests) {
    return false;
  }

  dataEvent.payload satisfies TestCoveragePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
