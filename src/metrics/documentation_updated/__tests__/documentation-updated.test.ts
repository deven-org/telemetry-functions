import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrMerged from "./fixtures/mocked-pull-request-merged.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";
import { Mocktokit } from "../../../__tests__/mocktokit";

// Only collect this metric
jest.mock("../../../metricsConditions.ts", () =>
  jest.requireActual("../metricsConditions")
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
    error: jest.fn(),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

const prFilesData = [
  {
    filename: "file1.txt",
    status: "added",
  },
  {
    filename: "file2.md",
    status: "removed",
  },
  {
    filename: "file3.md",
    status: "modified",
  },
  {
    filename: "doc/file4.md",
    status: "added",
  },
  {
    filename: "docs/file5.md",
    status: "renamed",
  },
];

describe("Documentation Updated", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.resetToDefault();
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequest.mock.calls).toStrictEqual([]);
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {},
        data: prFilesData,
      });

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        dataEventSignature: DataEventSignature.PullRequest,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {},
        data: prFilesData,
      });

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        dataEventSignature: DataEventSignature.PullRequest,
        metricsSignature: MetricsSignature.DocumentationUpdated,
        status: "success",
        output: {
          pr_id: 42424242,
          prFiles: {
            over100Files: false,
            mdFilesChanged: 4,
          },
        },
      },
    ]);
  });

  it("reports over100Files if result is paginated", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {
          link: '<somelink>; rel="next"',
        },
        data: prFilesData,
      });

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        dataEventSignature: DataEventSignature.PullRequest,
        metricsSignature: MetricsSignature.DocumentationUpdated,
        status: "success",
        output: {
          pr_id: 42424242,
          prFiles: {
            over100Files: true,
            mdFilesChanged: 4,
          },
        },
      },
    ]);
  });

  it("sets status to networkError if prFiles fetch fails", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => {
        throw new Error("mocked network error");
      };

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        dataEventSignature: DataEventSignature.PullRequest,
        metricsSignature: MetricsSignature.DocumentationUpdated,
        status: "networkError",
        output: {
          pr_id: 42424242,
          prFiles: null,
        },
      },
    ]);
  });

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList("pull_request");

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {},
        data: prFilesData,
      });

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
