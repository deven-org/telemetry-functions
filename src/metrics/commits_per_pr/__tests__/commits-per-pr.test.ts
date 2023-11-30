import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrClosed from "./fixtures/mocked-pull-request-closed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metricsConditions.ts", () =>
  jest.requireActual("../metricsConditions")
);

const octokitResponse = {
  data: [
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
  ],
};

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

describe("Commits Per PR", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrClosed,
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
      ...mockedPrClosed,
    };

    const output: [] = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        output: {
          commits: 4,
          additions: 10,
          deletions: 5,
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
          pr_id: 42424242,
        },
        owner: "owner",
        repo: "repo_name",
        metricsSignature: MetricsSignature.CommitsPerPr,
        dataEventSignature: DataEventSignature.PullRequest,
        status: "success",
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
