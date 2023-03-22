import { logger } from "../../core";
import { decode } from "js-base64";
import { keys, includes, find, propEq, toLower} from "ramda";
import { DataEvent, MetricsSignature } from "../../interfaces";
import {
  WorkflowJobTestCoveragePayload,
  WorkflowJobTestCoverageOutput,
} from "./interfaces";
import moment from "moment";
import octokit from "../../core/octokit";
import { isWorkflowJob } from "../../signatureConditions";

export const collectWorkflowsTestCoverageMetrics = async (
  dataEvent: DataEvent
): Promise<DataEvent> => {
  const payload = dataEvent.payload as WorkflowJobTestCoveragePayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const completed_at = moment.utc(payload.workflow_job.completed_at).valueOf();
  const created_at = moment.utc(payload.workflow_job.created_at).valueOf();
  const started_at = moment.utc(payload.workflow_job.started_at).valueOf();
  const duration = completed_at - started_at;
  const status = payload.workflow_job.status;
  const workflow_name = payload.workflow_job.workflow_name;
  const steps = payload.workflow_job.steps.map((step) => ({   
    ...step,
    started_at: moment.utc(step.started_at).valueOf(),
    completed_at: moment.utc(step.completed_at).valueOf(),
    duration:
      moment.utc(step.completed_at).valueOf() -
      moment.utc(step.started_at).valueOf(),
  }));

  const isWorkflowNameTest = includes('test', toLower(workflow_name));
  const stepRunTest = find(propEq('name', 'Run test'), steps);

  const test_coverage = {
    workflow_have_test_data: isWorkflowNameTest ? "yes" : "no",
    test_run_status: stepRunTest?.status,
    test_run_started_at: stepRunTest?.started_at,
    test_run_completed_at: stepRunTest?.completed_at,
    test_run_duration: stepRunTest?.duration,
    test_run_failed: stepRunTest?.status === "completed" && stepRunTest?.conclusion !== "success" ? "yes" : "no",
    test_run_conclusion: stepRunTest?.conclusion
  }

  console.log("testCoverageData", test_coverage);

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
  const output: WorkflowJobTestCoverageOutput = {
    repository: repo,
    completed_at,
    created_at,
    started_at,
    status,
    workflow_name,
    duration,
    steps,
    test_coverage
  };

  console.log(output);

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
