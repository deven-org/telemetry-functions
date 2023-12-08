import { collectWorkflowsTestCoverageMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { TestCoveragePayload } from "./interfaces";
import { isNameAboutTest } from "./is-name-about-test";

export const isSignedAsWorkflowJobTestCoverage = (
  triggerEvent: SignedTriggerEvent
) => {
  if (
    !validateEventSignature(
      triggerEvent,
      TriggerEventSignature.GithubWorkflowJob
    )
  ) {
    return false;
  }

  if (triggerEvent.payload.action !== "completed") {
    return false;
  }

  const isAboutTests = [
    triggerEvent.payload.workflow_job.name,
    triggerEvent.payload.workflow_job.workflow_name,
    ...triggerEvent.payload.workflow_job.steps.map((step) => step.name),
  ]
    .filter((name): name is string => name !== null)
    .some((name) => isNameAboutTest(name));

  if (!isAboutTests) {
    return false;
  }

  triggerEvent.payload satisfies TestCoveragePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsWorkflowJobTestCoverage, collectWorkflowsTestCoverageMetrics],
];

export default conditions;
