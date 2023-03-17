import { logger } from "../../core";
import { getDuration } from "../../shared/getDuration";
import { keys } from "ramda";
import { DataEvent } from "../../interfaces";
import {
  WorkflowJobCompletedOutput,
  WorkflowJobCompletedPayload,
} from "./interfaces";

export const collectWorfklowJobCompletedMetrics = (
  dataEvent: DataEvent
): DataEvent => {
  const payload = dataEvent.payload as WorkflowJobCompletedPayload;

  const output: WorkflowJobCompletedOutput = {
    repository: payload.repository.name,
    completed_at: payload.workflow_job.completed_at,
    created_at: payload.workflow_job.completed_at,
    started_at: payload.workflow_job.started_at,
    status: payload.workflow_job.status,
    name: payload.workflow_job.name,
    workflow_name: payload.workflow_job.workflow_name,
    run_attempt: payload.workflow_job.run_attempt,
    steps: payload.workflow_job.steps,
    duration: getDuration(
      payload.workflow_job.started_at,
      payload.workflow_job.completed_at
    ),
  };

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    output,
  };
};
