import {
  MetricData,
  DataEventSignature,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedDeploymentEvent from "./fixtures/mocked-deployment.json";
import mockedDeploymentList from "./fixtures/mocked-deployment-list.json";
import { DeploymentOutput } from "../interfaces";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

const octokitResponse = {
  data: mockedDeploymentList,
};

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
    const eventBody = {
      ...mockedDeploymentEvent,
    };

    const output = await handler(eventBody);

    expect(
      output.filter(
        (o: MetricData) => o.metricsSignature === MetricsSignature.Deployment
      )
    ).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        dataEventSignature: DataEventSignature.Deployment,
      },
    ]);
  });

  it("returns an empty array for timeSinceLastDeploy if there was no last deploy on env", async () => {
    const eventBody = {
      eventSignature: "deployment",
      action: "created",
      repo: "telemetry-functions",
      owner: "deven-org",
      deployment: {
        task: "deploy",
        payload: {},
        original_environment: "staging",
        environment: "none",
        description: "Deploy request from hubot",
        creator: {
          login: "octocat",
          id: 1,
          node_id: "MDQ6VXNlcjE=",
          type: "User",
          site_admin: false,
        },
        created_at: "2022-07-20T01:19:13Z",
        updated_at: "2012-07-20T01:19:13Z",
      },
      repository: {
        id: 599112999,
        node_id: "R_kgDOI7W9Jw",
        name: "telemetry-functions",
        full_name: "deven-org/telemetry-functions",
        private: false,
        owner: {
          login: "deven-org",
          id: 118735834,
          node_id: "O_kgDOBxPD2g",
          avatar_url: "https://avatars.githubusercontent.com/u/118735834?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/deven-org",
          type: "Organization",
          site_admin: false,
        },
      },
    };
    const output = await handler(eventBody);
    expect(
      output.filter((o: DeploymentOutput) => o.timeSinceLastDeploy)
    ).toEqual([]);
  });

  it("handles a range of mocked deployment events", async () => {
    const fixtures = getWebhookEventFixtureList("deployment");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          eventSignature: "deployment",
          ...fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`deployment fixture[${i}] INPUT`);
      expect(
        output?.filter(
          (out) => out.metricsSignature === MetricsSignature.Deployment
        )
      ).toMatchSnapshot(`deployment fixture[${i}] OUTPUT`);
    });
  });
});
