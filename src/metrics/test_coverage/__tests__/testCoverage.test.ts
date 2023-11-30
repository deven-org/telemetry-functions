import { DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

// Only collect this metric
jest.mock("../../../metricsConditions.ts", () =>
  jest.requireActual("../metricsConditions")
);

const octokitResponse = {};

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

describe("Test_Coverage", () => {
  const FAKE_NOW = 1700000000000;

  beforeAll(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
  });

  it("event gets signed as workflow_job event", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });

  it("returns collected metrics (no tests)", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobCompleted,
    };

    const output: [] = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_workflow_name_about_test: false,
          steps_about_test: [],
          has_failed_steps: false,
          total_tests_duration: 0,
        },
        repo: "telemetry-data",
        owner: "deven-org",
        status: "success",
      },
    ]);
  });

  it("returns collected metrics (with tests)", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobCompleted,
    };

    mockedWorkflowJobCompleted.workflow_job.workflow_name = "Just teStIng...";
    mockedWorkflowJobCompleted.workflow_job.steps[0].name = "Run some tests";
    mockedWorkflowJobCompleted.workflow_job.steps[0].conclusion = "failure";
    const output: [] = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_workflow_name_about_test: true,
          steps_about_test: [
            {
              completed_at: 1679311625000,
              conclusion: "failure",
              duration: 2000,
              name: "Run some tests",
              number: 1,
              started_at: 1679311623000,
              status: "completed",
            },
          ],
          has_failed_steps: true,
          total_tests_duration: 2000,
        },
        repo: "telemetry-data",
        owner: "deven-org",
        status: "success",
      },
    ]);
  });

  it("handles a range of mocked workflow_job events", async () => {
    const fixtures = getWebhookEventFixtureList("workflow_job");

    const output = await Promise.all(
      fixtures.map((fix) =>
        handler({
          eventSignature: "workflow_job",
          ...fix,
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
