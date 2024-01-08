import {
  SignedTriggerEvent,
  MetricSignature,
  MetricData,
} from "../../interfaces";
import {
  TestCoveragePayload,
  WorkflowJobTestCoverageOutput,
} from "./interfaces";
import { WorkflowStepCompleted } from "@octokit/webhooks-types";
import { getTimestamp } from "../../shared/get-timestamp";
import { isNameAboutTest } from "./is-name-about-test";

export const collectWorkflowsTestCoverageMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.TestCoverage>> => {
  const payload = triggerEvent.payload as TestCoveragePayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const conclusion = payload.workflow_job.conclusion;
  const id = payload.workflow_job.id;

  const isJobNameAboutTest = isNameAboutTest(payload.workflow_job.name);
  const isWorkflowNameAboutTest =
    payload.workflow_job.workflow_name !== null &&
    isNameAboutTest(payload.workflow_job.workflow_name);

  // For completed jobs, all steps must be completed too.
  const stepsAboutTest = (payload.workflow_job.steps as WorkflowStepCompleted[])
    .filter((step) => isNameAboutTest(step.name))
    .map(({ name, conclusion, number, started_at, completed_at }) => ({
      name,
      conclusion,
      number,
      started_at: getTimestamp(started_at),
      completed_at: getTimestamp(completed_at),
      duration: getTimestamp(completed_at) - getTimestamp(started_at),
    }));

  const hasFailedSteps =
    stepsAboutTest.filter((s) => s.conclusion !== "success").length > 0;
  const totalTestsDuration = stepsAboutTest.reduce(
    (duration, step) => duration + step.duration,
    0
  );

  const output: WorkflowJobTestCoverageOutput = {
    id,
    conclusion,
    is_job_name_about_test: isJobNameAboutTest,
    is_workflow_name_about_test: isWorkflowNameAboutTest,
    steps_about_test: stepsAboutTest,
    has_failed_steps: hasFailedSteps,
    total_tests_duration: totalTestsDuration,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.TestCoverage,
    owner,
    repo,
    status: "success",
    output,
  };
};
