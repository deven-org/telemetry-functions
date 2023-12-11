import { encode } from "js-base64";
import {
  TriggerEventSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedDeploymentEvent from "./fixtures/mocked-deployment.json";
import mockedDeploymentList from "./fixtures/mocked-deployment-list.json";
import mockedPackageJson from "./fixtures/mocked-package.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";
import { Mocktokit } from "../../../__tests__/mocktokit";
import { LogErrors } from "../../../shared/log-messages";

// Only collect this metric
jest.mock("../../../metrics-conditions.ts", () =>
  jest.requireActual("../metrics-conditions")
);

jest.mock(
  "./../../../core/octokit.ts",
  () => jest.requireActual("../../../__tests__/mocktokit").octokitModuleMock
);

jest.mock("../../../core/logger.ts", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: (e: unknown) => {
      if (
        ![
          LogErrors.networkErrorPackageJson,
          LogErrors.networkErrorDeployments,
        ].includes(e as LogErrors)
      ) {
        // end test if unexpected error is logged
        throw e;
      }
    },
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

describe("deployments", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.reset({
      // endpoint to save json data
      ["PUT /repos/{owner}/{repo}/contents/{path}"]: async () => undefined,
    });
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("event gets signed as deployment event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.Deployment,
      payload: mockedDeploymentEvent,
    };

    Mocktokit.mocks[
      "GET /repos/{owner}/{repo}/deployments?environment={environment}"
    ] = async () => ({
      headers: {},
      data: mockedDeploymentList,
    });

    Mocktokit.mocks["GET /repos/{owner}/{repo}/contents/{path}"] =
      async () => ({
        headers: {},
        data: { content: encode(JSON.stringify(mockedPackageJson)) },
      });

    const result = await handler(eventBody);

    expect(result).toMatchObject([
      {
        trigger_event_signature: TriggerEventSignature.GithubDeployment,
        created_at: FAKE_NOW,
        status: "success",
        output: {},
      },
    ]);
  });

  it("sets time_since_last_deploy to null if there was no previous deploy on env", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.Deployment,
      payload: mockedDeploymentEvent,
    };

    Mocktokit.mocks[
      "GET /repos/{owner}/{repo}/deployments?environment={environment}"
    ] = async () => ({
      headers: {},
      data: [],
    });

    Mocktokit.mocks["GET /repos/{owner}/{repo}/contents/{path}"] =
      async () => ({
        headers: {},
        data: { content: encode(JSON.stringify(mockedPackageJson)) },
      });

    const result = await handler(eventBody);

    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject({
      status: "success",
      output: {
        deploy_time: 1658193553000,
        duration: 86400000,
        env: "production",
        environment_deployments: {
          is_initial_deployment: true,
          time_since_last_deploy: null,
        },
        package_json: {
          is_parsable: true,
          version: "1.1.0",
        },
      },
    });
  });

  it("sets status to networkError if deployments fetch fails", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.Deployment,
      payload: mockedDeploymentEvent,
    };

    Mocktokit.mocks[
      "GET /repos/{owner}/{repo}/deployments?environment={environment}"
    ] = async () => {
      throw new Error("mocked deployments network error");
    };

    Mocktokit.mocks["GET /repos/{owner}/{repo}/contents/{path}"] =
      async () => ({
        headers: {},
        data: { content: encode(JSON.stringify(mockedPackageJson)) },
      });

    const result = await handler(eventBody);

    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject({
      status: "networkError",
      output: {
        deploy_time: 1658193553000,
        duration: 86400000,
        env: "production",
        environment_deployments: null,
        package_json: {
          is_parsable: true,
          version: "1.1.0",
        },
      },
    });
  });

  it("sets status to networkError if package_json fetch fails", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.Deployment,
      payload: mockedDeploymentEvent,
    };

    Mocktokit.mocks[
      "GET /repos/{owner}/{repo}/deployments?environment={environment}"
    ] = async () => ({
      headers: {},
      data: mockedDeploymentList,
    });

    Mocktokit.mocks["GET /repos/{owner}/{repo}/contents/{path}"] = async () => {
      throw new Error("mocked package_json network error");
    };

    const result = await handler(eventBody);

    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject({
      status: "networkError",
      output: {
        deploy_time: 1658193553000,
        duration: 86400000,
        env: "production",
        environment_deployments: {
          is_initial_deployment: false,
          time_since_last_deploy: 252374400000,
        },
        package_json: null,
      },
    });
  });

  it("handles a range of mocked deployment events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.Deployment);

    Mocktokit.mocks[
      "GET /repos/{owner}/{repo}/deployments?environment={environment}"
    ] = async () => ({
      headers: {},
      data: mockedDeploymentList,
    });

    Mocktokit.mocks["GET /repos/{owner}/{repo}/contents/{path}"] =
      async () => ({
        headers: {},
        data: { content: encode(JSON.stringify(mockedPackageJson)) },
      });

    const result = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: GithubEvent.Deployment,
          payload: fix,
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
