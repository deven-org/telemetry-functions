import { collectMetrics } from "../collect-metrics";
import "../logger";
import { SignedDataEvent, DataEventSignature } from "../../interfaces";

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

jest.mock("../../metrics-conditions", () => ({
  __esModule: true,
  default: [[() => true, (args) => ({ it: "works", ...args })]],
}));
describe("collect-metrics", () => {
  it("collects metrics and returns an array of promises, containing the metrics", async () => {
    const event = {
      dataEventSignature: "foo-signature" as DataEventSignature,
      payload: {},
      created_at: 100,
    };

    const expectedResult = {
      dataEventSignature: "foo-signature" as DataEventSignature,
      created_at: 100,
    };

    const collectedMetrics = await collectMetrics(event as SignedDataEvent);

    expect(collectedMetrics[0]).toMatchObject({
      it: "works",
      ...expectedResult,
    });
  });
});
