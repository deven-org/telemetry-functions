import { toLower, pipe, test } from "ramda";
import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import {
  TestCoveragePayload,
  WorkflowJobTestCoverageOutput,
} from "./interfaces";
import moment from "moment";
import { WorkflowStepCompleted } from "@octokit/webhooks-types";

const includesTestInString = pipe(toLower, test(/test/));

export const collectWorkflowsTestCoverageMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as TestCoveragePayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const status = payload.workflow_job.status;
  const conclusion = payload.workflow_job.conclusion;
  const id = payload.workflow_job.id;

  const is_workflow_name_about_test = includesTestInString(
    payload.workflow_job.workflow_name
  );

  // For completed jobs, all steps must be completed too.
  const steps_about_test = (
    payload.workflow_job.steps as WorkflowStepCompleted[]
  )
    .filter((step) => includesTestInString(step.name))
    .map(({ name, status, conclusion, number, started_at, completed_at }) => ({
      name,
      status,
      conclusion,
      number,
      started_at: moment.utc(started_at).valueOf(),
      completed_at: moment.utc(completed_at).valueOf(),
      duration:
        moment.utc(completed_at).valueOf() - moment.utc(started_at).valueOf(),
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
    output,
  };
};
