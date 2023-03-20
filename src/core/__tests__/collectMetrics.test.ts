import { collectMetrics } from "../collectMetrics";

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

jest.mock("../../metricsConditions", () => ({
  __esModule: true,
  default: [[() => true, (args) => ({ it: "works", ...args })]],
}));
describe("collectMetrics", () => {
  it("collects metrics and returns an array of promises, containing the metrics", async () => {
    const event: DataEvent = {
      dataEventSignature: "foo-signature" as DataEventSignature,
      payload: {},
      output: {},
      created_at: 100,
      owner: "",
      repo: "",
    };

    const collectedMetrics = await collectMetrics(event);
    const result = await Promise.all(collectedMetrics);

    expect(result[0]).toMatchObject({ it: "works", ...event });
  });
});
