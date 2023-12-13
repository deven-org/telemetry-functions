import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrMerged from "./fixtures/mocked-pull-request-merged.json";
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

const MOCK_SERVER_ERROR = new Error("mocked network error");

jest.mock("../../../core/logger.ts", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: (e: unknown) => {
      // end test if unexpected error is logged
      if (e !== MOCK_SERVER_ERROR) {
        throw e;
      }
    },
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

describe("documentation-updated", () => {
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
      payload: mockedPrMerged,
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
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.PullRequest,
      payload: mockedPrMerged,
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
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
        metric_signature: MetricSignature.DocumentationUpdated,
        status: "success",
        output: {
          pr_id: 42424242,
          pr_files: {
            over_100_files: false,
            md_files_changed: 4,
          },
        },
      },
    ]);
  });

  it("reports over_100_files if result is paginated", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.PullRequest,
      payload: mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {
          link: '<somelink>; rel="next"',
        },
        data: prFilesData,
      });

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
        metric_signature: MetricSignature.DocumentationUpdated,
        status: "success",
        output: {
          pr_id: 42424242,
          pr_files: {
            over_100_files: true,
            md_files_changed: 4,
          },
        },
      },
    ]);
  });

  it("sets status to networkError if pr_files fetch fails", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.PullRequest,
      payload: mockedPrMerged,
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => {
        throw MOCK_SERVER_ERROR;
      };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.GithubPullRequest,
        metric_signature: MetricSignature.DocumentationUpdated,
        status: "networkError",
        output: {
          pr_id: 42424242,
          pr_files: null,
        },
      },
    ]);
  });

  it("handles a range of mocked pull_request events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.PullRequest);

    Mocktokit.mocks["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"] =
      async () => ({
        headers: {},
        data: prFilesData,
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
