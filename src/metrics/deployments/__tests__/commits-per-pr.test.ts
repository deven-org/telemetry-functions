import {
  DataEvent,
  DataEventSignature,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrClosed from "./fixtures/mocked-pull-request-closed.json";

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
      commit: {
        author: {
          date: "2023-02-08T17:35:04Z",
        },
      },
    },
    {
      commit: {
        author: {
          date: "2023-02-08T18:35:04Z",
        },
      },
    },
    {
      commit: {
        author: {
          date: "2023-02-08T19:35:04Z",
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
  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrClosed,
    };

    const output = await handler(eventBody);
    expect(
      output.filter(
        (o: DataEvent) => o.metricsSignature === MetricsSignature.CommitsPerPr
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
      ...mockedPrClosed,
    };

    const output: [] = await handler(eventBody);

    expect(
      output.filter(
        (o: DataEvent) => o.metricsSignature === MetricsSignature.CommitsPerPr
      )
    ).toStrictEqual([
      {
        created_at: expect.any(Number),
        output: {
          commits: 4,
          additions: 10,
          deletions: 5,
          commit_timestamps: [
            1675874104000, 1675877704000, 1675881304000, 1675884904000,
          ],
          pull_number: 10,
        },
        owner: "owner",
        repo: "repo_name",
        metricsSignature: MetricsSignature.CommitsPerPr,
        dataEventSignature: DataEventSignature.PullRequest,
      },
    ]);
  });
});
