import {
  TriggerEventSignature,
  MetricsSignature,
  RawEvent,
  TriggerSource,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrClosed from "./fixtures/mocked-pull-request-closed.json";
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

describe("code-review-involvement", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "pull_request",
      payload: mockedPrClosed,
    };

    const output = await handler(eventBody);
    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        trigger_event_signature: TriggerEventSignature.PullRequest,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "pull_request",
      payload: mockedPrClosed,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {
          pr_id: 42424242,
          merged: true,
          created_at: 1675866904000,
          updated_at: 1675863304000,
          closed_at: 1675870504000,
          merged_at: 1675874104000,
          total_duration: 3600000,
          created_to_merged_duration: 7200000,
          updated_to_closed: 7200000,
          comments: 5,
          review_comments: 12,
          changed_files: 52,
          has_been_merged_by_author: false,
          requested_reviewers: 3,
          requested_teams: 0,
        },
        metricsSignature: MetricsSignature.CodeReviewInvolvement,
        trigger_event_signature: TriggerEventSignature.PullRequest,
      },
    ]);
  });

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList("pull_request");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: "pull_request",
          payload: fix,
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
