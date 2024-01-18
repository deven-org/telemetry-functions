import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";

import mockedCheckSuite from "./fixtures/mocked-check-suite.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";
import { Mocktokit, STORE_DATA_MOCKS } from "../../../__tests__/mocktokit";

// Only collect this metric
jest.mock("../../../metrics-conditions.ts", () =>
  jest.requireActual("../metrics-conditions")
);

jest.mock(
  "./../../../core/octokit.ts",
  () => jest.requireActual("../../../__tests__/mocktokit").octokitModuleMock
);

jest.mock("../../../core/logger.ts", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: (e: unknown) => {
      // end test if unexpected error is logged
      throw e;
    },
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

describe("check-suite", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.reset(STORE_DATA_MOCKS);
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.CheckSuite,
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.CheckSuite,
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        output: {
          id: 123456789,
          conclusion: "success",
          head_sha: "headSHA",
          created_at: 1678724577000,
          updated_at: 1678728177000,
          is_app_owner: true,
          pull_requests: [{ id: 41414141 }, { id: 42424242 }, { id: 43434343 }],
        },
        trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
        owner: "owner_name",
        repo: "repo_name",
        metric_signature: MetricSignature.CheckSuite,
        created_at: FAKE_NOW,
        status: "success",
      },
    ]);
  });

  it("handles a range of mocked check_suite events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.CheckSuite);

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: GithubEvent.CheckSuite,
          payload: fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`check_suite fixture[${i}] INPUT`);
      expect(output).toMatchSnapshot(`check_suite fixture[${i}] OUTPUT`);
    });
  });
});
