import { WorkflowStepCompleted } from "@octokit/webhooks-types";
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

  // For completed jobs, all steps must be completed too.
  const steps = (payload.workflow_job.steps as WorkflowStepCompleted[]).map(
    ({ name, status, conclusion, number, started_at, completed_at }) => ({
      name,
      status,
      conclusion,
      number,
      started_at: moment.utc(started_at).valueOf(),
      completed_at: moment.utc(completed_at).valueOf(),
      duration:
        moment.utc(completed_at).valueOf() - moment.utc(started_at).valueOf(),
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
