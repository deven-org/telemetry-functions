import {
  TriggerEventSignature,
  MetricData,
  MetricSignature,
} from "../../interfaces";
import { WorkflowsOutput } from "../../metrics/workflows/interfaces";
import { Mocktokit } from "../../__tests__/mocktokit";
import { storeData } from "../store-data";

jest.mock(
  "../octokit.ts",
  () => jest.requireActual("../../__tests__/mocktokit").octokitModuleMock
);

jest.mock("../logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn((e) => {
      // let tests fail if unexpected error gets reported
      throw e;
    }),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
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

const metricData: MetricData[] = [
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

describe("storeData", () => {
  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("pushes the enhanced data event to the data repo as json file", async () => {
    const putRequest = jest.fn(async () => undefined);
    Mocktokit.reset({
      // endpoint to save json data
      "PUT /repos/{owner}/{repo}/contents/{path}": putRequest,
    });

    await storeData(metricData);

    expect(putRequest).toHaveBeenCalledTimes(2);
    expect(putRequest.mock.calls).toMatchInlineSnapshot(`
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
      "owner": "data-repo-owner",
      "path": "raw-data/owner/repo/workflow-job/100.json",
      "repo": "data-repo-name",
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
      "owner": "data-repo-owner",
      "path": "raw-data/owner/repo/workflow-job/100.json",
      "repo": "data-repo-name",
    },
  ],
]
`);
  });
});
