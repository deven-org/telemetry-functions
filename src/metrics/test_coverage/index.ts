import { logger } from "../../core";
import { keys,} from "ramda";
import { DataEvent, MetricsSignature } from "../../interfaces";
import { WorkflowJobCompletedPayload } from "../workflows/interfaces";
import { WorkflowJobTestCoverageOutput } from "./interfaces";
import moment from "moment";

export const collectWorkflowsTestCoverageMetrics = async (
  dataEvent: DataEvent
): Promise<DataEvent> => {
  const payload = dataEvent.payload as WorkflowJobCompletedPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const workflow_job = payload.workflow_job;
  const workflow_name = payload.workflow_job.workflow_name;
  
  const steps = payload.workflow_job.steps.map((step) => ({   
    ...step,
    duration:
      moment.utc(step.completed_at).valueOf() -
      moment.utc(step.started_at).valueOf(),
  }));

  const isWorkflowJobFailed = workflow_job.status === "completed" && workflow_job.conclusion !== "success";
  const isWorkflowNameTest = workflow_name.toLowerCase().includes('test');
  const stepRunTest = steps.find(step => step.name.includes('test'));

  const hasTestWokflowFailed = isWorkflowNameTest && isWorkflowJobFailed;
  const hasTestStepFailed =  stepRunTest?.status === "completed" && stepRunTest?.conclusion !== "success";
  const test_step_duration =  stepRunTest?.duration;
  const test_step_status =  stepRunTest?.status;
  const test_step_conclusion =  stepRunTest?.conclusion;
  
  const output: WorkflowJobTestCoverageOutput = {
    repository: repo,
    workflow_name,
    hasTestWokflowFailed,
    hasTestStepFailed,
    test_step_duration,
    test_step_status,
    test_step_conclusion
  };

  logger.success(
    `Collected metrics for "${dataEvent.dataEventSignature}": %s`,
    keys(output).join(", ")
  );

  return {
    ...dataEvent,
    metricsSignature: MetricsSignature.TestCoverage,
    repo,
    owner,
    output,
  };
};
