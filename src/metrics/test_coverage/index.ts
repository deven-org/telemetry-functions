import { toLower, pipe, test } from "ramda";
import { DataEvent, MetricsSignature } from "../../interfaces";
import { WorkflowJobCompletedPayload } from "../workflows/interfaces";
import { WorkflowJobTestCoverageOutput } from "./interfaces";
import moment from "moment";

const includesTestInString = pipe(toLower, test(/test/));

export const collectWorkflowsTestCoverageMetrics = async (
  dataEvent: DataEvent
): Promise<DataEvent> => {
  const payload = dataEvent.payload as WorkflowJobCompletedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const status = payload.workflow_job.status;
  const conclusion = payload.workflow_job.conclusion;
  const id = payload.workflow_job.id;

  const is_workflow_name_about_test = includesTestInString(
    payload.workflow_job.workflow_name
  );
  const steps_about_test = payload.workflow_job.steps
    .filter((step) => includesTestInString(step.name))
    .map((step) => ({
      ...step,
      duration:
        moment.utc(step.completed_at).valueOf() -
        moment.utc(step.started_at).valueOf(),
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
    ...dataEvent,
    metricsSignature: MetricsSignature.TestCoverage,
    repo,
    owner,
    output,
  };
};
