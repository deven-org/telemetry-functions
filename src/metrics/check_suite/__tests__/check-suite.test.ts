import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";

import mockedCheckSuite from "./fixtures/mocked-check-suite.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

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

describe("Check Suite", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "check_suite",
      ...mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.CheckSuite,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody = {
      eventSignature: "check_suite",
      ...mockedCheckSuite,
    };

    const output: [] = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        output: {
          conclusion: "success",
          duration: 3600000,
          created_at: 1678724577000,
          updated_at: 1678728177000,
          is_app_owner: true,
          pull_requests: [{}, {}, {}],
        },
        dataEventSignature: DataEventSignature.CheckSuite,
        owner: "owner_name",
        repo: "repo_name",
        metricsSignature: MetricsSignature.CheckSuite,
        created_at: FAKE_NOW,
      },
    ]);
  });

  it("handles a range of mocked check_suite events", async () => {
    const fixtures = getWebhookEventFixtureList("check_suite");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          eventSignature: "check_suite",
          ...fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`check_suite fixture[${i}] INPUT`);
      expect(
        output?.filter(
          (out) => out.metricsSignature === MetricsSignature.CheckSuite
        )
      ).toMatchSnapshot(`check_suite fixture[${i}] OUTPUT`);
    });
  });
});
