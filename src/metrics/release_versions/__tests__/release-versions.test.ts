import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";

import mockedCheckSuite from "./fixtures/mocked-pull-request-closed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metricsConditions.ts", () =>
  jest.requireActual("../metricsConditions")
);

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
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
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

    expect(output).toMatchObject([
      {
        output: {
          pr_id: undefined,
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

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList("pull_request");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          eventSignature: "pull_request",
          ...fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`pull_request fixture[${i}] INPUT`);
      expect(output).toMatchSnapshot(`pull_request fixture[${i}] OUTPUT`);
    });
  });
});
