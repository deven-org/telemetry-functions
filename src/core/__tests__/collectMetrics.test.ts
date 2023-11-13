import { collectMetrics } from "../collectMetrics";

import "../logger";
import { CheckedMetricsDataEvent, DataEventSignature } from "../../interfaces";
import { WorkflowJobCompletedEvent } from "../../github.interfaces";

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
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));
jest.mock("../../metrics", () => ({
  __esModule: true,
  metrics: { ["test-metric"]: (args) => ({ it: "works", ...args }) },
}));

describe("collectMetrics", () => {
  it("collects metrics and returns an array of promises, containing the metrics", async () => {
    const event = {
      dataEventSignature: "foo-signature" as DataEventSignature,
      payload: {} as WorkflowJobCompletedEvent,
      created_at: 100,
      metricsToApply: ["test-metric"],
    };

    const collectedMetrics = await collectMetrics(
      event as CheckedMetricsDataEvent
    );
    const result = await Promise.all(collectedMetrics);

    expect(result[0]).toMatchObject({ it: "works", ...event });
  });
});
