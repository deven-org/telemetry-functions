import { DataEventSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import mockedPackageWithDocSkeleton from "./fixtures/mocked-package.json";
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
  },
}));

describe("Test Coverage", () => {
  it("event gets signed as workflow_job event", async () => {
    const eventBody = {
      ...mockedWorkflowJobTestCoverage,
      eventSignature: "workflow_job",
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

  it("returns with test_coverage data", async () => {
    const eventBody = {
      ...mockedWorkflowJobTestCoverage,
      eventSignature: "workflow_job"
    };

    const output = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {test_coverage: {}},
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });
  
  it("returns collected metrics", async () => {
    const eventBody = {
      ...mockedWorkflowJobTestCoverage,
      eventSignature: "workflow_job"
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
    };

    const output: [] = await handler(eventBody);

    expect(output).toMatchObject([
      {
        created_at: expect.any(Number),
        output: {
          repository: mockedWorkflowJobTestCoverage.repository,
          completed_at: 1679311634000,
          created_at: 1679311618000,
          started_at: 1679311624000,
          status: "completed",
          workflow_name: "Unit Test",
          run_attempt: 1,
          duration: 10000,
          steps: [
            {
              name: 'Set up job',
              status: 'completed',
              conclusion: 'success',
              number: 1,
              started_at: 1679327383000,
              completed_at: 1679327386000,
              duration: 3000
            },
            {
              name: 'Check out repository code',
              status: 'completed',
              conclusion: 'success',
              number: 2,
              started_at: 1679327386000,
              completed_at: 1679327387000,
              duration: 1000
            },
            {
              name: 'Setup node environment',
              status: 'completed',
              conclusion: 'success',
              number: 3,
              started_at: 1679327388000,
              completed_at: 1679327393000,
              duration: 5000
            },
            {
              name: 'Cache dependencies',
              status: 'completed',
              conclusion: 'success',
              number: 4,
              started_at: 1679327393000,
              completed_at: 1679327399000,
              duration: 6000
            },
            {
              name: 'Install Dependencies',
              status: 'completed',
              conclusion: 'skipped',
              number: 5,
              started_at: 1679327400000,
              completed_at: 1679327400000,
              duration: 0
            },
            {
              name: 'Run test',
              status: 'completed',
              conclusion: 'success',
              number: 6,
              started_at: 1679327400000,
              completed_at: 1679327411000,
              duration: 11000
            },
            {
              name: 'Post Cache dependencies',
              status: 'completed',
              conclusion: 'success',
              number: 10,
              started_at: 1679327411000,
              completed_at: 1679327411000,
              duration: 0
            },
            {
              name: 'Post Setup node environment',
              status: 'completed',
              conclusion: 'success',
              number: 11,
              started_at: 1679327412000,
              completed_at: 1679327412000,
              duration: 0
            },
            {
              name: 'Post Check out repository code',
              status: 'completed',
              conclusion: 'success',
              number: 12,
              started_at: 1679327412000,
              completed_at: 1679327412000,
              duration: 0
            },
            {
              name: 'Complete job',
              status: 'completed',
              conclusion: 'success',
              number: 13,
              started_at: 1679327412000,
              completed_at: 1679327412000,
              duration: 0
            }
          ],
          test_coverage: {
            workflow_have_test_data: 'yes',
            test_run_status: 'completed',
            test_run_started_at: 1679327400000,
            test_run_completed_at: 1679327411000,
            test_run_duration: 11000,
            test_run_failed: 'no',
            test_run_conclusion: 'success'
          },
        },
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });
});
