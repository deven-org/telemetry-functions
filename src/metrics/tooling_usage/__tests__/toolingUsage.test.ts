import { DataEventSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mergedCompletedSuccessfully from "./fixtures/merged-completed-successful.json";
import { encode, decode } from "js-base64";
import mockedPackageWithDocSkeleton from "./fixtures/mocked-package.json";

let octokitResponse = {};

jest.mock("./../../../core/octokit.ts", () => ({
  __esModule: true,
  default: {
    request: () => octokitResponse,
  },
}));

describe("Tooling_Usage", () => {
  beforeEach(() => {});

  afterEach(() => {});

  it("event gets signed as a toolingUsage event", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: {},
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
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

    const output = await handler(eventBody);

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: { hasDocumentationSkeleton: true },
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
  });

  it("returns false if package does not have deven-documentation-skeleton ", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    let mockedPackageWithoutDocSkeleton = JSON.parse(
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

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: { hasDocumentationSkeleton: false },
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
  });

  it("returns false if there are no devDependencies", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    let mockedPackageWithoutDocSkeleton = JSON.parse(
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

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: { hasDocumentationSkeleton: false },
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
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

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: { hasValidPackageJson: false },
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
  });
});
