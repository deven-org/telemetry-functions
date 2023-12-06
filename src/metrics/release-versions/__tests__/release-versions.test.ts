import {
  TriggerEventSignature,
  MetricsSignature,
  RawEvent,
  TriggerSource,
} from "../../../interfaces";
import { handler } from "../../../handler";

import mockedCheckSuite from "./fixtures/mocked-tag-create-event.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metrics-conditions.ts", () =>
  jest.requireActual("../metrics-conditions")
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

describe("release-versions", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as create event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "create",
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        trigger_event_signature: TriggerEventSignature.TagOrBranchCreation,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "create",
      payload: mockedCheckSuite,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        output: {
          releaseVersion: {
            build: [],
            major: 1,
            minor: 2,
            patch: 3,
            prerelease: [],
            raw: "1.2.3",
            version: "1.2.3",
          },
        },
        trigger_event_signature: TriggerEventSignature.TagOrBranchCreation,
        owner: "owner",
        repo: "repo_name",
        metricsSignature: MetricsSignature.ReleaseVersions,
        created_at: expect.any(Number),
      },
    ]);
  });

  it("handles a range of mocked create events", async () => {
    const fixtures = getWebhookEventFixtureList("create");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: "create",
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
