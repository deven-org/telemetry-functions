import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  DevenEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import { Mocktokit } from "../../../__tests__/mocktokit";

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
    error: jest.fn(),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

describe("tooling-usage", () => {
  const FAKE_NOW = 1700000000000;

  const GET_CONFIG_ENDPOINT = "GET /repos/{owner}/{repo}/contents/{path}";

  const eventBody: RawEvent = {
    source: TriggerSource.Deven,
    sourceEventSignature: DevenEvent.ToolingUsage,
    payload: {
      owner: "test-owner",
      repo: "test-repo",
    },
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

    const result = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
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

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentation_skeleton_config: {
            exists: false,
            parsable: null,
            version: null,
          },
        },
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        metric_signature: MetricSignature.ToolingUsage,
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

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentation_skeleton_config: {
            exists: true,
            parsable: false,
            version: null,
          },
        },
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        metric_signature: MetricSignature.ToolingUsage,
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

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentation_skeleton_config: {
            exists: true,
            parsable: true,
            version: null,
          },
        },
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        metric_signature: MetricSignature.ToolingUsage,
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

    const result = await handler(eventBody);

    expect(result).toStrictEqual([
      {
        created_at: FAKE_NOW,
        status: "success",
        output: {
          documentation_skeleton_config: {
            exists: true,
            parsable: true,
            version: "2.0.0",
          },
        },
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        metric_signature: MetricSignature.ToolingUsage,
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
          documentation_skeleton_config: null,
        },
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        metric_signature: MetricSignature.ToolingUsage,
        owner: "test-owner",
        repo: "test-repo",
      },
    ]);
  });
});
