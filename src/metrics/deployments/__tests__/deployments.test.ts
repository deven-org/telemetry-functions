import { DataEventSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedDeploymentEvent from "./fixtures/mocked-deployment.json";
import mockedDeploymentList from "./fixtures/mocked-deployment-list.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metricsConditions.ts", () =>
  jest.requireActual("../metricsConditions")
);

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

describe("Deployments", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as deployment event", async () => {
    octokitResponse = {
      data: mockedDeploymentList,
    };
    const eventBody = {
      ...mockedDeploymentEvent,
    };

    const result = await handler(eventBody);

    expect(result).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        dataEventSignature: DataEventSignature.Deployment,
      },
    ]);
  });

  it("sets timeSinceLastDeploy to null if there was no previous deploy on env", async () => {
    octokitResponse = {};
    const eventBody = {
      ...mockedDeploymentEvent,
    };

    const result = await handler(eventBody);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      output: {
        timeSinceLastDeploy: null,
      },
    });
  });

  it("handles a range of mocked deployment events", async () => {
    octokitResponse = {
      data: mockedDeploymentList,
    };
    const fixtures = getWebhookEventFixtureList("deployment");

    const result = await Promise.all(
      fixtures.map((fix) =>
        handler({
          eventSignature: "deployment",
          ...fix,
        })
      )
    );

    result.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`deployment fixture[${i}] INPUT`);
      expect(output).toMatchSnapshot(`deployment fixture[${i}] OUTPUT`);
    });
  });
});
