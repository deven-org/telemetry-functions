import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { WorkflowsOutput, WorkflowsPayload } from "./interfaces";
import moment from "moment";

export const collectWorkflowsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as WorkflowsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const completed_at = moment.utc(payload.workflow_job.completed_at).valueOf();
  const created_at = moment.utc(payload.workflow_job.created_at).valueOf();
  const started_at = moment.utc(payload.workflow_job.started_at).valueOf();
  const duration = completed_at - started_at;
  const status = payload.workflow_job.status;
  const workflow_name = payload.workflow_job.workflow_name;
  const run_attempt = payload.workflow_job.run_attempt;
  const steps = payload.workflow_job.steps.map((step) => ({
    ...step,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Null is not possible here for completed jobs
    conclusion: step.conclusion!,
    started_at: moment.utc(step.started_at).valueOf(),
    completed_at: moment.utc(step.completed_at).valueOf(),
    duration:
      moment.utc(step.completed_at).valueOf() -
      moment.utc(step.started_at).valueOf(),
  }));

  const output: WorkflowsOutput = {
    completed_at,
    created_at,
    started_at,
    status,
    workflow_name,
    run_attempt,
    duration,
    steps,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.WorkflowJob,
    owner,
    repo,
    output,
  };
};
