import { logger } from "../../core";
import { decode } from "js-base64";
import { keys } from "ramda";
import { DataEvent } from "../../interfaces";
import {
  WorkflowJobCompletedOutput,
  WorkflowJobCompletedPayload,
} from "./interfaces";
import moment from "moment";
import octokit from "../../core/octokit";

export const collectWorkflowsMetrics = async (
  dataEvent: DataEvent
): Promise<DataEvent> => {
  const payload = dataEvent.payload as WorkflowJobCompletedPayload;

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
    started_at: moment.utc(step.started_at).valueOf(),
    completed_at: moment.utc(step.completed_at).valueOf(),
    duration:
      moment.utc(step.completed_at).valueOf() -
      moment.utc(step.started_at).valueOf(),
  }));

  let packages = [];
  try {
    const getPackageJson = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: owner,
        repo: repo,
        path: "package.json",
      }
    );
    packages = JSON.parse(decode(getPackageJson.data["content"]));
  } catch (e) {
    packages = [];
  }
  const output: WorkflowJobCompletedOutput = {
    repository: repo,
    completed_at,
    created_at,
    started_at,
    status,
    workflow_name,
    run_attempt,
    duration,
    steps,
    packages,
  };

  return {
    ...dataEvent,
    repo,
    owner,
    output,
  };
};
