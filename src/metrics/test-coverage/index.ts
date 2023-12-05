import {
  SignedDataEvent,
  MetricsSignature,
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
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.TestCoverage>> => {
  const payload = dataEvent.payload as TestCoveragePayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const status = payload.workflow_job.status;
  const conclusion = payload.workflow_job.conclusion;
  const id = payload.workflow_job.id;

  const is_job_name_about_test = isNameAboutTest(payload.workflow_job.name);
  const is_workflow_name_about_test =
    payload.workflow_job.workflow_name !== null &&
    isNameAboutTest(payload.workflow_job.workflow_name);

  // For completed jobs, all steps must be completed too.
  const steps_about_test = (
    payload.workflow_job.steps as WorkflowStepCompleted[]
  )
    .filter((step) => isNameAboutTest(step.name))
    .map(({ name, status, conclusion, number, started_at, completed_at }) => ({
      name,
      status,
      conclusion,
      number,
      started_at: getTimestamp(started_at),
      completed_at: getTimestamp(completed_at),
      duration: getTimestamp(completed_at) - getTimestamp(started_at),
    }));

  const has_failed_steps =
    steps_about_test.filter((s) => s.conclusion !== "success").length > 0;
  const total_tests_duration = steps_about_test.reduce(
    (duration, step) => duration + step.duration,
    0
  );

  const output: WorkflowJobTestCoverageOutput = {
    id,
    status,
    conclusion,
    is_job_name_about_test,
    is_workflow_name_about_test,
    steps_about_test,
    has_failed_steps,
    total_tests_duration,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.TestCoverage,
    owner,
    repo,
    status: "success",
    output,
  };
};
