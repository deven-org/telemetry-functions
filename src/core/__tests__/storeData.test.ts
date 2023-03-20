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
    success: jest.fn(),
  },
}));

const dataSignatureResponse = {
  dataEventSignature: DataEventSignature.WorkflowJob,
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
  addSignature: () => {
    return new Promise((res) => {
      res(dataSignatureResponse);
    });
  },
}));

const collectMetricsResponse: (
  | EnhancedDataEvent
  | Promise<EnhancedDataEvent>
)[] = [
  {
    dataEventSignature: DataEventSignature.WorkflowJob,
    created_at: 100,
    output: {
      foo: "foo",
      bar: "bar",
    },
    owner: "owner",
    repo: "repo",
  },
  new Promise((res) =>
    res({
      dataEventSignature: DataEventSignature.WorkflowJob,
      created_at: 100,
      output: {
        foo: "foo",
        bar: "bar",
      },
      owner: "owner",
      repo: "repo",
    })
  ),
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
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJjcmVhdGVkX2F0IjoxMDAsIm91dHB1dCI6eyJmb28iOiJmb28iLCJiYXIiOiJiYXIifSwib3duZXIiOiJvd25lciIsInJlcG8iOiJyZXBvIn0=",
        message: "auto(data): add workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/100.json",
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
          "eyJkYXRhRXZlbnRTaWduYXR1cmUiOiJ3b3JrZmxvdy1qb2IiLCJjcmVhdGVkX2F0IjoxMDAsIm91dHB1dCI6eyJmb28iOiJmb28iLCJiYXIiOiJiYXIifSwib3duZXIiOiJvd25lciIsInJlcG8iOiJyZXBvIn0=",
        message: "auto(data): add workflow-job for owner/repo",
        owner: "deven-org",
        path: "raw-data/100.json",
        repo: "telemetry-data",
      }
    );
  });
});
