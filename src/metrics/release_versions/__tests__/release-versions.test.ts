import {
  DataEventSignature,
  MetricData,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";

import mockedCheckSuite from "./fixtures/mocked-pull-request-closed.json";

const octokitResponse = {};

jest.mock("./../../../core/octokit.ts", () => ({
  __esModule: true,
  default: {
    request: () => octokitResponse,
  },
}));

jest.mock("../../../core/logger.ts", () => ({
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

describe("Release versions", () => {
  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(
      output.filter(
        (o: MetricData) =>
          o.metricsSignature === MetricsSignature.ReleaseVersions
      )
    ).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.PullRequest,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(
      output.filter(
        (o: MetricData) =>
          o.metricsSignature === MetricsSignature.ReleaseVersions
      )
    ).toMatchObject([
      {
        output: {
          pull_number: undefined,
          title: null,
        },
        dataEventSignature: DataEventSignature.PullRequest,
        owner: "owner",
        repo: "repo_name",
        metricsSignature: MetricsSignature.ReleaseVersions,
        created_at: expect.any(Number),
      },
    ]);
  });
});
