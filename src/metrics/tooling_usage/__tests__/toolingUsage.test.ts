import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";

let octokitResponse = {};

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

describe("Tooling_Usage", () => {
  it("event gets signed as a toolingUsage event", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify({})),
      },
    };

    const result: [] = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.ToolingUsage,
      },
    ]);
  });

  it("returns true if deven-documentation-skeleton config file is available", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify({})),
      },
    };

    const result: [] = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          hasDocumentationSkeleton: true,
          documentationSkeletonVersion: undefined,
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("returns version if available in deven-documentation-skeleton config file", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify({ version: "2.0.0" })),
      },
    };

    const result: [] = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          hasDocumentationSkeleton: true,
          documentationSkeletonVersion: "2.0.0",
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("returns false if deven-documentation-skeleton config file has not been found", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      status: 404,
    };

    const result = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          hasDocumentationSkeleton: false,
          documentationSkeletonVersion: undefined,
        },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });
});
