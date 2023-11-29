import { WorkflowStepCompleted } from "@octokit/webhooks-types";
import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { WorkflowsOutput, WorkflowsPayload } from "./interfaces";
import { getTimestamp } from "../../shared/getTimestamp";

export const collectWorkflowsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.WorkflowJob>> => {
  const payload = dataEvent.payload as WorkflowsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- for completed jobs completed_at must be set
  const completed_at = getTimestamp(payload.workflow_job.completed_at!);
  const created_at = getTimestamp(payload.workflow_job.created_at);
  const started_at = getTimestamp(payload.workflow_job.started_at);
  const duration = completed_at - started_at;
  const status = payload.workflow_job.status;
  const workflow_name = payload.workflow_job.workflow_name;
  const run_attempt = payload.workflow_job.run_attempt;

  // For completed jobs, all steps must be completed too.
  const steps = (payload.workflow_job.steps as WorkflowStepCompleted[]).map(
    ({ name, status, conclusion, number, started_at, completed_at }) => ({
      name,
      status,
      conclusion,
      number,
      started_at: getTimestamp(started_at),
      completed_at: getTimestamp(completed_at),
      duration: getTimestamp(completed_at) - getTimestamp(started_at),
    })
  );

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
