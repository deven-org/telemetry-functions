import { DataEvent, DataEventSignature, MetricsSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mockedWorkflowJobTestCoverage from "./fixtures/mocked-workflow-job-test-coverage.json";

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

describe("Test_Coverage", () => {
  it("event gets signed as workflow_job event", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobTestCoverage,
    };

    const output = await handler(eventBody);

    expect(
      output.filter(o => o.metricsSignature === MetricsSignature.TestCoverage)
    ).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {},
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });

  it("event has the word 'test' in workflow_name",async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobTestCoverage,
    };

    const output = await handler(eventBody);

    expect(
      output.filter(o => o.metricsSignature === MetricsSignature.TestCoverage)
    ).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {workflow_name: 'Unit Test'},
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobTestCoverage,
    };

    const output: [] = await handler(eventBody);

    expect(
      output.filter((o: DataEvent) => o.metricsSignature === MetricsSignature.TestCoverage)
    ).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          repository: mockedWorkflowJobTestCoverage.repository.name,
          workflow_name: "Unit Test",
          hasTestWokflowFailed: false,
          hasTestStepFailed: false,
          test_step_duration: 11000,
          test_step_status: "completed",
          test_step_conclusion: "success"
          
        },
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.TestCoverage,
      },
    ]);
  });
});
