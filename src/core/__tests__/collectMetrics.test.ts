import octokit from "../octokit";
import { collectMetrics } from "../collectMetrics";
import "../../metricsConditions";

import { handler } from "../../handler";
import "../logger";
import { DataEvent, DataEventSignature } from "../../interfaces";

jest.mock("../logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
    success: jest.fn(),
  },
}));

describe("collectMetrics", () => {
  it("collects metrics and returns an array of promises, containing the metrics", async () => {
    const event: DataEvent = {
      dataEventSignature: DataEventSignature.ToolingUsage,
      payload: {},
      output: {},
      created_at: 100,
      owner: "",
      repo: "",
    };

    const collectedMetrics = await collectMetrics(event);
    const result = await Promise.all(collectedMetrics);

    expect(result[0]).toMatchObject({
      dataEventSignature: "deven-tooling-usage",
      payload: {},
      output: {
        hasDocumentationSkeleton: false,
        dependencies: [],
        devDependencies: [],
        owner: undefined,
        repo: undefined,
        hasValidPackageJson: false,
      },
      created_at: 100,
      owner: "",
      repo: "",
    });
  });
});
