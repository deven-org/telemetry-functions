import { WorkflowStepCompleted } from "@octokit/webhooks-types";
import {
  SignedTriggerEvent,
  MetricSignature,
  MetricData,
} from "../../interfaces";
import { WorkflowsOutput, WorkflowsPayload } from "./interfaces";
import { getTimestamp } from "../../shared/get-timestamp";

export const collectWorkflowsMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.WorkflowJob>> => {
  const payload = triggerEvent.payload as WorkflowsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- for completed jobs completed_at must be set
  const completedAt = getTimestamp(payload.workflow_job.completed_at!);
  const createdAt = getTimestamp(payload.workflow_job.created_at);
  const startedAt = getTimestamp(payload.workflow_job.started_at);
  const duration = completedAt - startedAt;
  const conclusion = payload.workflow_job.conclusion;
  const workflowName = payload.workflow_job.workflow_name;
  const runAttempt = payload.workflow_job.run_attempt;

  // For completed jobs, all steps must be completed too.
  const steps = (payload.workflow_job.steps as WorkflowStepCompleted[]).map(
    ({
      name,
      conclusion: stepConclusion,
      number,
      started_at,
      completed_at,
    }) => ({
      name,
      conclusion: stepConclusion,
      number,
      started_at: getTimestamp(started_at),
      completed_at: getTimestamp(completed_at),
      duration: getTimestamp(completed_at) - getTimestamp(started_at),
    })
  );

  const output: WorkflowsOutput = {
    completed_at: completedAt,
    created_at: createdAt,
    started_at: startedAt,
    conclusion,
    workflow_name: workflowName,
    run_attempt: runAttempt,
    duration,
    steps,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.WorkflowJob,
    owner,
    repo,
    status: "success",
    output,
  };
};
