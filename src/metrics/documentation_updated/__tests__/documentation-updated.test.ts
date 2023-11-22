import {
  MetricData,
  DataEventSignature,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedPrMerged from "./fixtures/mocked-pull-request-merged.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

const octokitResponse = {
  data: [
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

describe("Documentation Updated", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as pull_request event", async () => {
    const eventBody = {
      eventSignature: "pull_request",
      ...mockedPrMerged,
    };

    const output = await handler(eventBody);
    expect(
      output.filter(
        (o: MetricData) =>
          o.metricsSignature === MetricsSignature.DocumentationUpdated
      )
    ).toMatchObject([
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

    const output: [] = await handler(eventBody);

    expect(
      output.filter(
        (o: MetricData) =>
          o.metricsSignature === MetricsSignature.DocumentationUpdated
      )
    ).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {
          repo: "repo_name",
          owner: "owner",
          number: 10,
          mdFilesChanged: 4,
        },
        metricsSignature: MetricsSignature.DocumentationUpdated,
        dataEventSignature: DataEventSignature.PullRequest,
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
      expect(
        output?.filter(
          (out) =>
            out.metricsSignature === MetricsSignature.DocumentationUpdated
        )
      ).toMatchSnapshot(`pull_request fixture[${i}] OUTPUT`);
    });
  });
});
