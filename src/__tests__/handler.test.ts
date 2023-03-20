import * as moduleAddSignature from "../core/addSignature";
import * as moduleCollectMetrics from "../core/collectMetrics";
import { handler } from "../handler";
import { logger } from "../core/logger";
import { LogWarnings } from "../shared/logMessages";

jest.mock("../core/octokit", () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

jest.mock("../core/logger", () => ({
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

const spyOnAddSignature = jest.spyOn(moduleAddSignature, "addSignature");
const spyOnCollectMetrics = jest.spyOn(moduleCollectMetrics, "collectMetrics");
const spyOnStoreData = jest.spyOn(moduleCollectMetrics, "collectMetrics");

describe("handler", () => {
  it("calls addSignature passing the given event payload", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "toolingUsage",
    };
    await handler(event);
    expect(spyOnAddSignature).toBeCalledWith({
      bar: "bar",
      foo: "foo",
      eventSignature: "toolingUsage",
    });
  });
  it("calls collectMetrics passing a signed event, given that the event is known", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "toolingUsage",
    };

    await handler(event);

    expect(spyOnCollectMetrics).toBeCalledWith({
      created_at: expect.any(Number),
      dataEventSignature: "deven-tooling-usage",
      owner: "",
      repo: "",
      output: {},
      payload: {
        foo: "foo",
        bar: "bar",
        eventSignature: "toolingUsage",
      },
    });
  });

  xit("doesn't call collectMetrics if the event is unknown", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "foo",
    };

    await handler(event);

    expect(spyOnCollectMetrics).not.toBeCalled();
    expect((logger as any).warn).toBeCalledWith(
      LogWarnings.signingEventSignatureNotRecognized
    );
  });

  it("calls storeData passing an enhanced data event, given that the metrics can be collects", async () => {
    const event = {
      foo: "foo",
      bar: "bar",
      eventSignature: "toolingUsage",
    };

    await handler(event);

    expect(spyOnStoreData).toBeCalledWith({
      created_at: expect.any(Number),
      dataEventSignature: "deven-tooling-usage",
      output: {},
      owner: "",
      payload: {
        bar: "bar",
        eventSignature: "toolingUsage",
        foo: "foo",
      },
      repo: "",
    });
  });
});
