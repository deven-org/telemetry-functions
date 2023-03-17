import octokit from "../../core/octokit";
import "../../core/collectMetrics";
import "../../core/addSignature";
import {
  DataEvent,
  DataEventSignature,
  EnhancedDataEvent,
} from "../../interfaces";
import { handler } from "../../handler";
import "../logger";

jest.mock("../logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
  },
}));

const dataSignatureResponse: DataEvent = {
  dataEventSignature: DataEventSignature.WorkflowJobCompleted,
  created_at: 100,
  output: {},
  payload: {
    foo: "foo",
    bar: "bar",
  },
  owner: "owner",
  repo: "repo",
};

jest.mock("../../core/addSignature", () => ({
  __esModule: true,
  addSignature: (data: any) => {
    return new Promise((res) => {
      res(dataSignatureResponse);
    });
  },
}));

const collectMetricsResponse: EnhancedDataEvent = {
  dataEventSignature: DataEventSignature.WorkflowJobCompleted,
  created_at: 100,
  output: {
    foo: "foo",
    bar: "bar",
  },
  owner: "owner",
  repo: "repo",
};

jest.mock("../../core/collectMetrics", () => ({
  __esModule: true,
  collectMetrics: (data: any) => {
    return new Promise((res) => {
      res(collectMetricsResponse);
    });
  },
}));

jest.mock("../../core/octokit", () => ({
  request: jest.fn().mockImplementation(() => {
    return {
      request: jest.fn(),
    };
  }),
}));

describe("storeData", () => {
  it("pushes the enhanced data event to the data repo as json file", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "event-signature",
    };
    await handler(event);

    expect(octokit.request).toHaveBeenCalledWith(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        committer: { email: "committer_email", name: "committer_name" },
        content:
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2ItY29tcGxldGVkIiwiY3JlYXRlZF9hdCI6MTAwLCJvdXRwdXQiOnsiZm9vIjoiZm9vIiwiYmFyIjoiYmFyIn0sIm93bmVyIjoib3duZXIiLCJyZXBvIjoicmVwbyJ9",
        message: "auto(data): add workflow-job-completed for owner/repo",
        owner: "deven-org",
        path: "raw-data",
        repo: "telemetry-data",
        author: {
          email: "author_email",
          name: "author_name",
        },
      }
    );
  });
});
