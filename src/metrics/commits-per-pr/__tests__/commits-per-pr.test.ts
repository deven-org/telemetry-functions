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
import { Mocktokit } from "../../../__tests__/mocktokit";

// Only collect this metric
jest.mock("../../../metrics-conditions.ts", () =>
  jest.requireActual("../metrics-conditions")
);

jest.mock(
  "./../../../core/octokit.ts",
  () => jest.requireActual("../../../__tests__/mocktokit").octokitModuleMock
);

const commitsData = [
  {
    commit: {
      author: {
        date: "2023-02-08T16:35:04Z",
      },
    },
  },
  {
    commit: {},
  },
  {
    commit: {
      author: {
        date: "2023-02-08T18:35:04Z",
      },
      committer: {
        date: "2023-02-08T22:35:04Z",
      },
    },
  },
  {
    commit: {
      author: {
        date: "2023-02-08T19:35:04Z",
      },
      committer: {
        date: "2023-02-08T22:36:04Z",
      },
    },
  },
];

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

describe("commits-per-pr", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.reset({
      // endpoint to save json data
      ["PUT /repos/{owner}/{repo}/contents/{path}"]: async () => undefined,
    });
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

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"] =
      async () => ({
        headers: {},
        data: commitsData,
      });

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

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"] =
      async () => ({
        headers: {},
        data: commitsData,
      });

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        output: {
          pr_id: 42424242,
          additions: 10,
          deletions: 5,
          commits: {
            amount: 4,
            commit_timestamps: [
              {
                authored: 1675874104000,
                committed: null,
              },
              {
                authored: null,
                committed: null,
              },
              {
                authored: 1675881304000,
                committed: 1675895704000,
              },
              {
                authored: 1675884904000,
                committed: 1675895764000,
              },
            ],
          },
        },
        owner: "owner",
        repo: "repo_name",
        metric_signature: MetricSignature.CommitsPerPr,
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
        status: "success",
      },
    ]);
  });

  it("sets status to networkError if commits fetch fails", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.PullRequest,
      payload: mockedPrClosed,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"] =
      async () => {
        throw new Error("mocked network error");
      };

    const result = await handler(eventBody);

    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject({
      created_at: FAKE_NOW,
      output: {
        pr_id: 42424242,
        additions: 10,
        deletions: 5,
        commits: null,
      },
      owner: "owner",
      repo: "repo_name",
      metric_signature: MetricSignature.CommitsPerPr,
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      status: "networkError",
    });
  });

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.PullRequest);

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"] =
      async () => ({
        headers: {},
        data: commitsData,
      });

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
