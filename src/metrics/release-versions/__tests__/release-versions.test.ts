import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import { Mocktokit, STORE_DATA_MOCKS } from "../../../__tests__/mocktokit";
import mockedCheckSuite from "./fixtures/mocked-tag-create-event.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

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

describe("release-versions", () => {
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

  it("event gets signed as create event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.TagOrBranchCreation,
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        trigger_event_signature:
          TriggerEventSignature.GithubTagOrBranchCreation,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.TagOrBranchCreation,
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        output: {
          release_version: {
            build: [],
            major: 1,
            minor: 2,
            patch: 3,
            prerelease: [],
            raw: "1.2.3",
            version: "1.2.3",
          },
        },
        trigger_event_signature:
          TriggerEventSignature.GithubTagOrBranchCreation,
        owner: "owner",
        repo: "repo_name",
        metric_signature: MetricSignature.ReleaseVersions,
        created_at: expect.any(Number),
      },
    ]);
  });

  it("handles a range of mocked create events", async () => {
    const fixtures = getWebhookEventFixtureList(
      GithubEvent.TagOrBranchCreation
    );

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: GithubEvent.TagOrBranchCreation,
          payload: fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`create fixture[${i}] INPUT`);
      expect(output).toMatchSnapshot(`create fixture[${i}] OUTPUT`);
    });
  });
});
