import * as moduleAddSignature from "../core/add-signature";
import * as moduleCollectMetrics from "../core/collect-metrics";
import { handler } from "../handler";
import { logger } from "../core/logger";
import { LogErrors, LogWarnings } from "../shared/log-messages";
import {
  DevenEvent,
  GithubEvent,
  TriggerEventSignature,
  TriggerSource,
} from "../interfaces";
import { Mocktokit, STORE_DATA_MOCKS } from "./mocktokit";

jest.mock(
  "../core/octokit.ts",
  () => jest.requireActual("../__tests__/mocktokit").octokitModuleMock
);

jest.mock("../core/logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn((e) => {
      // let tests fail if unexpected error gets reported
      if (e !== LogErrors.networkErrorDocumentationSkeletonConfig) {
        throw e;
      }
    }),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

const spyOnAddSignature = jest.spyOn(moduleAddSignature, "addSignature");
const spyOnCollectMetrics = jest.spyOn(moduleCollectMetrics, "collectMetrics");
const spyOnStoreData = jest.spyOn(moduleCollectMetrics, "collectMetrics");

describe("handler", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.reset(STORE_DATA_MOCKS, {
      // endpoint tooling usage uses for getting repo info
      ["GET /repos/{owner}/{repo}/contents/{path}"]: async () => {
        throw new Error("known test error");
      },
    });
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("calls addSignature passing the given event payload", async () => {
    const event = {
      source: TriggerSource.Deven,
      sourceEventSignature: DevenEvent.ToolingUsage,
      payload: {
        owner: "foo",
        repo: "bar",
      },
    };
    await handler(event);
    expect(spyOnAddSignature).toBeCalledWith(event);
  });

  it("calls collectMetrics passing a signed event, given that the event is known", async () => {
    const event = {
      source: TriggerSource.Deven,
      sourceEventSignature: DevenEvent.ToolingUsage,
      payload: {
        owner: "foo",
        repo: "bar",
      },
    };

    await handler(
      event,
      "githubAccessTokenSourceRepo",
      "githubAccessTokenDataRepo"
    );

    expect(spyOnCollectMetrics).toBeCalledWith(
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        payload: {
          owner: "foo",
          repo: "bar",
        },
      },
      "githubAccessTokenSourceRepo"
    );
  });

  it("doesn't call collectMetrics if the source is unknown", async () => {
    const event = {
      source: TriggerSource.Unknown,
      sourceEventSignature: GithubEvent.PullRequest,
      payload: {
        owner: "foo",
        repo: "bar",
      },
    };

    await handler(event);

    expect(spyOnCollectMetrics).not.toBeCalled();
    expect(logger.skip).toBeCalledWith(
      LogWarnings.signingEventSignatureNotRecognized
    );
  });

  it("doesn't call collectMetrics if the event is unknown", async () => {
    const event = {
      source: TriggerSource.Deven,
      sourceEventSignature: "foo",
      payload: {
        owner: "foo",
        repo: "bar",
      },
    };

    await handler(event);

    expect(spyOnCollectMetrics).not.toBeCalled();
    expect(logger.skip).toBeCalledWith(
      LogWarnings.signingEventSignatureNotRecognized
    );
  });

  it("calls storeData passing an enhanced data event, given that the metrics can be collects", async () => {
    const event = {
      source: TriggerSource.Deven,
      sourceEventSignature: DevenEvent.ToolingUsage,
      payload: {
        owner: "foo",
        repo: "bar",
      },
    };

    await handler(
      event,
      "githubAccessTokenSourceRepo",
      "githubAccessTokenDataRepo"
    );

    expect(spyOnStoreData).toBeCalledWith(
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
        payload: {
          owner: "foo",
          repo: "bar",
        },
      },
      "githubAccessTokenSourceRepo"
    );
  });
});
