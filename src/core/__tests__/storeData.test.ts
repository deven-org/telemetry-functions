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
import { WorkflowJobCompletedEvent } from "../../github.interfaces";
import { WorkflowJobCompletedOutput } from "../../metrics/workflows/interfaces";

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

const payload: Partial<WorkflowJobCompletedEvent> = {
  action: "foo",
};

const dataSignatureResponse = {
  dataEventSignature: DataEventSignature.WorkflowJob,
  created_at: 100,
  payload,
};

jest.mock("../../core/addSignature", () => ({
  __esModule: true,
  addSignature: () => {
    return new Promise((res) => {
      res(dataSignatureResponse);
    });
  },
}));

const output: WorkflowJobCompletedOutput = {
  repository: "repo",
  created_at: 4000,
  started_at: 4000,
  completed_at: 5000,
  duration: 1000,
  status: "completed",
  workflow_name: "workflow-name",
  run_attempt: 1,
  steps: [],
  packages: {},
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
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsicmVwb3NpdG9yeSI6InJlcG8iLCJjcmVhdGVkX2F0Ijo0MDAwLCJzdGFydGVkX2F0Ijo0MDAwLCJjb21wbGV0ZWRfYXQiOjUwMDAsImR1cmF0aW9uIjoxMDAwLCJzdGF0dXMiOiJjb21wbGV0ZWQiLCJ3b3JrZmxvd19uYW1lIjoid29ya2Zsb3ctbmFtZSIsInJ1bl9hdHRlbXB0IjoxLCJzdGVwcyI6W10sInBhY2thZ2VzIjp7fX0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyJ9",
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
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsicmVwb3NpdG9yeSI6InJlcG8iLCJjcmVhdGVkX2F0Ijo0MDAwLCJzdGFydGVkX2F0Ijo0MDAwLCJjb21wbGV0ZWRfYXQiOjUwMDAsImR1cmF0aW9uIjoxMDAwLCJzdGF0dXMiOiJjb21wbGV0ZWQiLCJ3b3JrZmxvd19uYW1lIjoid29ya2Zsb3ctbmFtZSIsInJ1bl9hdHRlbXB0IjoxLCJzdGVwcyI6W10sInBhY2thZ2VzIjp7fX0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyJ9",
        message: "auto(data): add workflow-job - workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/owner/repo/workflow-job/100.json",
        repo: "telemetry-data",
      }
    );
  });
});
