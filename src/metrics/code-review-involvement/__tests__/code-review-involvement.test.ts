import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrClosed from "./fixtures/mocked-pull-request-closed.json";
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

describe("code-review-involvement", () => {
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
      sourceEventSignature: GithubEvent.PullRequest,
      payload: mockedPrClosed,
    };

    const output = await handler(eventBody);
    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.PullRequest,
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
        metric_signature: MetricSignature.CodeReviewInvolvement,
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      },
    ]);
  });

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.PullRequest);

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: GithubEvent.PullRequest,
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
