import {
  DataEventSignature,
  MetricsSignature,
  RawEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import { Mocktokit } from "../../../__tests__/mocktokit";
import { ToolingUsagePayload } from "../interfaces";

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

describe("Tooling_Usage", () => {
  const FAKE_NOW = 1700000000000;

  const GET_CONFIG_ENDPOINT = "GET /repos/{owner}/{repo}/contents/{path}";

  const eventBody: RawEvent & ToolingUsagePayload = {
    eventSignature: "toolingUsage",
    owner: "test-owner",
    repo: "test-repo",
  };

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

  it("event gets signed as a toolingUsage event", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => ({
      data: {
        content: encode(JSON.stringify({})),
      },
    });

    const result: [] = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        dataEventSignature: DataEventSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });

  it("sets exists: false, if config file is missing", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => {
      const error: Error & { status?: number } = new Error("test: not found");
      error.status = 404;
      throw error;
    };

    const result: [] = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentationSkeletonConfig: {
            exists: false,
            parsable: null,
            version: null,
          },
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });

  it("sets exists: true, if config file is available", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => ({
      data: {
        content: encode(JSON.stringify([1, 2, 3])),
      },
    });

    const result: [] = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentationSkeletonConfig: {
            exists: true,
            parsable: false,
            version: null,
          },
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });

  it("sets parsable: true, if config file is parsable", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => ({
      data: {
        content: encode(JSON.stringify({ some: "data" })),
      },
    });

    const result: [] = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentationSkeletonConfig: {
            exists: true,
            parsable: true,
            version: null,
          },
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });

  it("returns version if available in deven-documentation-skeleton config file", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => ({
      data: {
        content: encode(JSON.stringify({ version: "2.0.0" })),
      },
    });

    const result: [] = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentationSkeletonConfig: {
            exists: true,
            parsable: true,
            version: "2.0.0",
          },
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });

  it("sets status to networkError and config to null if config fetch fails", async () => {
    Mocktokit.mocks[GET_CONFIG_ENDPOINT] = async () => {
      const error: Error & { status?: number } = new Error("test: not found");
      error.status = 500;
      throw error;
    };

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "networkError",
        output: {
          documentationSkeletonConfig: null,
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });
});
