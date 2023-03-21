import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import mockedPackageWithDocSkeleton from "./fixtures/mocked-package.json";

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
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
    };

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.ToolingUsage,
      },
    ]);
  });

  it("returns true if package has deven-documentation-skeleton", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
    };

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: { hasDocumentationSkeleton: true },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("returns false if package does not have deven-documentation-skeleton ", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    const mockedPackageWithoutDocSkeleton = JSON.parse(
      JSON.stringify(mockedPackageWithDocSkeleton)
    );

    delete mockedPackageWithoutDocSkeleton.devDependencies[
      "deven-documentation-skeleton"
    ];

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithoutDocSkeleton)),
      },
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: { hasDocumentationSkeleton: false },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("returns false if there are no devDependencies", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    const mockedPackageWithoutDocSkeleton = JSON.parse(
      JSON.stringify(mockedPackageWithDocSkeleton)
    );

    delete mockedPackageWithoutDocSkeleton.devDependencies;
    delete mockedPackageWithoutDocSkeleton.dependencies;

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithoutDocSkeleton)),
      },
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: { hasDocumentationSkeleton: false },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("return hasValidPackageJson=false if package.json is invalid", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: undefined,
      },
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: { hasValidPackageJson: false },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });

  it("returns hasDocChapters=false if number of chapters are not equal to 9", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: undefined,
      },
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: { hasDocChapters: false },
        dataEventSignature: DataEventSignature.ToolingUsage,
        metricsSignature: MetricsSignature.ToolingUsage,
      },
    ]);
  });
});
