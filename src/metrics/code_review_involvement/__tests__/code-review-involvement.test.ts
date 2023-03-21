import { DataEventSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrClosed from "./fixtures/mocked-pull-request-closed.json";

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

describe("Code Reviews Involvement", () => {
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

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          repo: "repo_name",
          owner: "owner",
          number: 10,
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
        dataEventSignature: DataEventSignature.PullRequest,
      },
    ]);
  });
});
