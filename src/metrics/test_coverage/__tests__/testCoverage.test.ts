import {
  MetricData,
  DataEventSignature,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";

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
  it("event gets signed as workflow_job event", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(
      output.filter((o) => o.metricsSignature === MetricsSignature.TestCoverage)
    ).toMatchObject([
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

    expect(
      output.filter(
        (o) =>
          (o as MetricData).metricsSignature === MetricsSignature.TestCoverage
      )
    ).toStrictEqual([
      {
        created_at: expect.any(Number),
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

    expect(
      output.filter(
        (o) =>
          (o as MetricData).metricsSignature === MetricsSignature.TestCoverage
      )
    ).toStrictEqual([
      {
        created_at: expect.any(Number),
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_workflow_name_about_test: true,
          steps_about_test: [
            {
              completed_at: "2023-03-20T11:27:05.000Z",
              conclusion: "failure",
              duration: 2000,
              name: "Run some tests",
              number: 1,
              started_at: "2023-03-20T11:27:03.000Z",
              status: "completed",
            },
          ],
          has_failed_steps: true,
          total_tests_duration: 2000,
        },
        repo: "telemetry-data",
        owner: "deven-org",
      },
    ]);
  });
});
