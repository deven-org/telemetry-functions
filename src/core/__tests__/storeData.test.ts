import octokit from "../../core/octokit";
import "../../core/collectMetrics";
import "../../core/addSignature";
import "../logger";
import { storeData } from "../storeData";
import { DataEventSignature, MetricsSignature } from "../../interfaces";

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

jest.mock("../../core/octokit", () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

describe("storeData", () => {
  it("pushes the enhanced data event to the data repo as json file", async () => {
    const event = [
      {
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.WorkflowJob,
        created_at: 100,
        output: {
          repository: "test-repo-1",
          created_at: 4000,
          started_at: 4000,
          completed_at: 5000,
          duration: 1000,
          status: "completed",
          workflow_name: "workflow-name-1",
          run_attempt: 1,
          steps: [],
          packages: {},
        },
        owner: "owner",
        repo: "repo",
      },
      {
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        created_at: 100,
        output: {
          repository: "test-repo",
          created_at: 7000,
          started_at: 7000,
          completed_at: 9000,
          duration: 2000,
          status: "completed",
          workflow_name: "workflow-name-2",
          run_attempt: 1,
          steps: [],
          packages: {},
        },
        owner: "owner",
        repo: "repo",
      },
    ];

    await storeData(event);

    expect(octokit.request).toHaveBeenCalledTimes(2);
    expect(octokit.request).toHaveBeenNthCalledWith(
      1,
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        committer: { email: "committer_email", name: "committer_name" },
        content:
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsiZm9vIjoiZm9vIiwiYmFyIjoiYmFyIn0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyJ9",
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
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJtZXRyaWNzU2lnbmF0dXJlIjoid29ya2Zsb3ctam9iIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsiZm9vIjoiZm9vIiwiYmFyIjoiYmFyIn0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyJ9",
        message: "auto(data): add workflow-job - workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/owner/repo/workflow-job/100.json",
        repo: "telemetry-data",
      }
    );
  });
});
