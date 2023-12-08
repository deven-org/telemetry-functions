import octokit from "../../core/octokit";
// imports needed for mocking to succeed
import "../../core/collect-metrics";
import "../../core/add-signature";
import {
  TriggerEventSignature,
  MetricData,
  MetricSignature,
  TriggerSource,
  GithubEvent,
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
  trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
  created_at: 100,
  payload: getWebhookEventFixture(
    GithubEvent.WorkflowJob,
    (ex) => ex.action === "completed"
  ),
};

jest.mock("../../core/add-signature", () => ({
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
    trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
    metric_signature: MetricSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
    status: "success",
  },
  {
    trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
    metric_signature: MetricSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
    status: "success",
  },
];

jest.mock("../../core/collect-metrics", () => ({
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
      source: TriggerSource.Unknown,
      sourceEventSignature: "event-signature",
      payload: {
        foo: "foo",
        bar: "bar",
      },
    };
    await handler(event);

    expect(octokit.request).toHaveBeenCalledTimes(2);
    expect(
      (octokit.request as unknown as jest.Mock).mock.calls
    ).toMatchInlineSnapshot(`
[
  [
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      "author": {
        "email": "author_email",
        "name": "author_name",
      },
      "committer": {
        "email": "committer_email",
        "name": "committer_name",
      },
      "content": "eyJ0cmlnZ2VyX2V2ZW50X3NpZ25hdHVyZSI6ImdpdGh1Yjo6d29ya2Zsb3dfam9iIiwibWV0cmljX3NpZ25hdHVyZSI6IndvcmtmbG93LWpvYiIsImNyZWF0ZWRfYXQiOjEwMCwib3V0cHV0Ijp7ImNyZWF0ZWRfYXQiOjQwMDAsInN0YXJ0ZWRfYXQiOjQwMDAsImNvbXBsZXRlZF9hdCI6NTAwMCwiZHVyYXRpb24iOjEwMDAsInN0YXR1cyI6ImNvbXBsZXRlZCIsIndvcmtmbG93X25hbWUiOiJ3b3JrZmxvdy1uYW1lIiwicnVuX2F0dGVtcHQiOjEsInN0ZXBzIjpbXX0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyIsInN0YXR1cyI6InN1Y2Nlc3MifQ==",
      "message": "auto(data): add github::workflow_job => workflow-job for owner/repo",
      "owner": "deven-org",
      "path": "raw-data/owner/repo/workflow-job/100.json",
      "repo": "telemetry-data",
    },
  ],
  [
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      "author": {
        "email": "author_email",
        "name": "author_name",
      },
      "committer": {
        "email": "committer_email",
        "name": "committer_name",
      },
      "content": "eyJ0cmlnZ2VyX2V2ZW50X3NpZ25hdHVyZSI6ImdpdGh1Yjo6d29ya2Zsb3dfam9iIiwibWV0cmljX3NpZ25hdHVyZSI6IndvcmtmbG93LWpvYiIsImNyZWF0ZWRfYXQiOjEwMCwib3V0cHV0Ijp7ImNyZWF0ZWRfYXQiOjQwMDAsInN0YXJ0ZWRfYXQiOjQwMDAsImNvbXBsZXRlZF9hdCI6NTAwMCwiZHVyYXRpb24iOjEwMDAsInN0YXR1cyI6ImNvbXBsZXRlZCIsIndvcmtmbG93X25hbWUiOiJ3b3JrZmxvdy1uYW1lIiwicnVuX2F0dGVtcHQiOjEsInN0ZXBzIjpbXX0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyIsInN0YXR1cyI6InN1Y2Nlc3MifQ==",
      "message": "auto(data): add github::workflow_job => workflow-job for owner/repo",
      "owner": "deven-org",
      "path": "raw-data/owner/repo/workflow-job/100.json",
      "repo": "telemetry-data",
    },
  ],
]
`);
  });
});
