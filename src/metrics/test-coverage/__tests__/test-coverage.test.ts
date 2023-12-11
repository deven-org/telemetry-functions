import {
  TriggerEventSignature,
  MetricSignature,
  RawEvent,
  TriggerSource,
  GithubEvent,
} from "../../../interfaces";
import { handler } from "../../../handler";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";
import mockedWorkflowJobCompletedWithTestSteps from "./fixtures/mocked-workflow-job-completed-with-test-steps.json";
import mockedWorkflowJobCompletedWithTestWorkflowName from "./fixtures/mocked-workflow-job-completed-with-test-workflow.json";
import mockedWorkflowJobCompletedWithTestName from "./fixtures/mocked-workflow-job-completed-with-test-name.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";
import { Mocktokit } from "../../../__tests__/mocktokit";

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
      // end test if unexpected error is logged
      throw e;
    },
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

  beforeEach(() => {
    Mocktokit.reset({
      // endpoint to save json data
      ["PUT /repos/{owner}/{repo}/contents/{path}"]: async () => undefined,
    });
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("event gets signed as test_coverage event", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompletedWithTestName,
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

  it("collects no metrics if not about test", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompleted,
    };

    const output = await handler(eventBody);

    expect(output).toStrictEqual(undefined);
  });

  it("returns collected metrics (with test in job name)", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompletedWithTestName,
    };

    const output = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
        metric_signature: MetricSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_job_name_about_test: true,
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

  it("returns collected metrics (with test in workflow name)", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompletedWithTestWorkflowName,
    };

    const output = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
        metric_signature: MetricSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_job_name_about_test: false,
          is_workflow_name_about_test: true,
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

  it("returns collected metrics (with test in step names)", async () => {
    const eventBody: RawEvent = {
      source: TriggerSource.Github,
      sourceEventSignature: GithubEvent.WorkflowJob,
      payload: mockedWorkflowJobCompletedWithTestSteps,
    };

    const output = await handler(eventBody);

    expect(output).toStrictEqual([
      {
        created_at: FAKE_NOW,
        trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
        metric_signature: MetricSignature.TestCoverage,
        output: {
          id: 12126810024,
          status: "completed",
          conclusion: "failure",
          is_job_name_about_test: false,
          is_workflow_name_about_test: false,
          steps_about_test: [
            {
              completed_at: 1679311626000,
              conclusion: "success",
              duration: 1000,
              name: "Run jest",
              number: 2,
              started_at: 1679311625000,
              status: "completed",
            },
            {
              completed_at: 1679311686000,
              conclusion: "failure",
              duration: 60000,
              name: "Run cypress",
              number: 2,
              started_at: 1679311626000,
              status: "completed",
            },
          ],
          has_failed_steps: true,
          total_tests_duration: 61000,
        },
        repo: "telemetry-data",
        owner: "deven-org",
        status: "success",
      },
    ]);
  });

  it("handles a range of mocked workflow_job events", async () => {
    const fixtures = getWebhookEventFixtureList(GithubEvent.WorkflowJob);

    fixtures.forEach((fix) => (fix.workflow_job.name = "Run tests"));

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
