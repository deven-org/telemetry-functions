import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
} from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import mockedPackageWithDocSkeleton from "./fixtures/mocked-package.json";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metrics-conditions.ts", () =>
  jest.requireActual("../metrics-conditions")
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

describe("workflows", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as workflow_job event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "workflow_job",
      payload: mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        trigger_event_signature: TriggerEventSignature.WorkflowJob,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: "workflow_job",
      payload: mockedWorkflowJobCompleted,
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
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
        trigger_event_signature: TriggerEventSignature.WorkflowJob,
        metric_signature: MetricSignature.WorkflowJob,
      },
    ]);
  });

  it("handles a range of mocked workflow_job events", async () => {
    const fixtures = getWebhookEventFixtureList("workflow_job");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          source: TriggerSource.Github,
          sourceEventSignature: "workflow_job",
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
