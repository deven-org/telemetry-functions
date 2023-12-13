import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";
import { Mocktokit, STORE_DATA_MOCKS } from "../../../__tests__/mocktokit";

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
      // end test if error is logged
      throw e;
    },
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

describe("workflows", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  beforeEach(() => {
    Mocktokit.reset(STORE_DATA_MOCKS);
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("event gets signed as workflow_job event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {
          completed_at: 1679311634000,
          created_at: 1679311618000,
          started_at: 1679311624000,
          status: "completed",
          workflow_name: "Parse Data",
          run_attempt: 1,
          duration: 10000,
          steps: [
            {
              name: "Set up job",
              status: "completed",
              conclusion: "success",
              number: 1,
              started_at: 1679311623000,
              completed_at: 1679311625000,
            },
            {
              completed_at: 1679311626000,
              conclusion: "success",
              duration: 1000,
              name: "Check out repository code",
              number: 2,
              started_at: 1679311625000,
              status: "completed",
            },
          ],
        },
        trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
        metric_signature: MetricSignature.WorkflowJob,
      },
    ]);
  });

  it("handles a range of mocked workflow_job events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.WorkflowJob);

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: GithubEvent.WorkflowJob,
          payload: fix,
        })
      )
    );

    output.forEach((output, i) => {
      // Early error if our fixtures got updated - regenerate the snapshots!
      expect(fixtures[i]).toMatchSnapshot(`workflow_job fixture[${i}] INPUT`);
      expect(output).toMatchSnapshot(`workflow_job fixture[${i}] OUTPUT`);
    });
  });
});
