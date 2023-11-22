import octokit from "../../core/octokit";
import "../../core/collectMetrics";
import "../../core/addSignature";
import {
  DataEventSignature,
  MetricData,
  MetricsSignature,
} from "../../interfaces";
import { handler } from "../../handler";
import "../logger";
import { WorkflowsOutput } from "../../metrics/workflows/interfaces";
import { getWebhookEventFixture } from "../../__tests__/fixtures/github-webhook-events";

jest.mock("../logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

const dataSignatureResponse = {
  dataEventSignature: DataEventSignature.WorkflowJob,
  created_at: 100,
  payload: getWebhookEventFixture(
    "workflow_job",
    (ex) => ex.action === "completed"
  ),
};

jest.mock("../../core/addSignature", () => ({
  __esModule: true,
  addSignature: () => {
    return new Promise((res) => {
      res(dataSignatureResponse);
    });
  },
}));

const output: WorkflowsOutput = {
  created_at: 4000,
  started_at: 4000,
  completed_at: 5000,
  duration: 1000,
  status: "completed",
  workflow_name: "workflow-name",
  run_attempt: 1,
  steps: [],
};

const collectMetricsResponse: MetricData[] = [
  {
    dataEventSignature: DataEventSignature.WorkflowJob,
    metricsSignature: MetricsSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
  },
  {
    dataEventSignature: DataEventSignature.WorkflowJob,
    metricsSignature: MetricsSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
  },
];

jest.mock("../../core/collectMetrics", () => ({
  __esModule: true,
  collectMetrics: () => collectMetricsResponse,
}));

jest.mock("../../core/octokit", () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

describe("storeData", () => {
  it("pushes the enhanced data event to the data repo as json file", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "event-signature",
    };
    await handler(event);

    expect(octokit.request).toHaveBeenCalledTimes(2);
    expect(octokit.request).toHaveBeenNthCalledWith(
      1,
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        committer: { email: "committer_email", name: "committer_name" },
        content:
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsiY3JlYXRlZF9hdCI6NDAwMCwic3RhcnRlZF9hdCI6NDAwMCwiY29tcGxldGVkX2F0Ijo1MDAwLCJkdXJhdGlvbiI6MTAwMCwic3RhdHVzIjoiY29tcGxldGVkIiwid29ya2Zsb3dfbmFtZSI6IndvcmtmbG93LW5hbWUiLCJydW5fYXR0ZW1wdCI6MSwic3RlcHMiOltdfSwib3duZXIiOiJvd25lciIsInJlcG8iOiJyZXBvIn0=",
        message: "auto(data): add workflow-job - workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/owner/repo/workflow-job/100.json",
        repo: "telemetry-data",
        author: {
          email: "author_email",
          name: "author_name",
        },
      }
    );
    expect(octokit.request).toHaveBeenNthCalledWith(
      2,
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        author: { email: "author_email", name: "author_name" },
        committer: { email: "committer_email", name: "committer_name" },
        content:
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsiY3JlYXRlZF9hdCI6NDAwMCwic3RhcnRlZF9hdCI6NDAwMCwiY29tcGxldGVkX2F0Ijo1MDAwLCJkdXJhdGlvbiI6MTAwMCwic3RhdHVzIjoiY29tcGxldGVkIiwid29ya2Zsb3dfbmFtZSI6IndvcmtmbG93LW5hbWUiLCJydW5fYXR0ZW1wdCI6MSwic3RlcHMiOltdfSwib3duZXIiOiJvd25lciIsInJlcG8iOiJyZXBvIn0=",
        message: "auto(data): add workflow-job - workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/owner/repo/workflow-job/100.json",
        repo: "telemetry-data",
      }
    );
  });
});
