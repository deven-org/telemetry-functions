import {
  MetricData,
  DataEventSignature,
  MetricsSignature,
} from "../../../interfaces";
import { handler } from "../../../handler";
import { encode } from "js-base64";
import mockedPackageWithDocSkeleton from "./fixtures/mocked-package.json";
import mockedWorkflowJobCompleted from "./fixtures/mocked-workflow-job-completed.json";
import { getWebhookEventFixtureList } from "../../../__tests__/fixtures/github-webhook-events";

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

describe("Workflows", () => {
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

    expect(
      output.filter((o) => o.metricsSignature === MetricsSignature.WorkflowJob)
    ).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {},
        dataEventSignature: DataEventSignature.WorkflowJob,
      },
    ]);
  });

  it("returns collected metrics", async () => {
    const eventBody = {
      eventSignature: "workflow_job",
      ...mockedWorkflowJobCompleted,
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(mockedPackageWithDocSkeleton)),
      },
    };

    const output: [] = await handler(eventBody);

    expect(
      output.filter(
        (o: MetricData) => o.metricsSignature === MetricsSignature.WorkflowJob
      )
    ).toMatchObject([
      {
        created_at: FAKE_NOW,
        output: {
          repository: mockedWorkflowJobCompleted.repository.name,
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
          packages: {
            dependencies: {
              "@netlify/functions": "^1.4.0",
              "@octokit/rest": "^19.0.7",
              dotenv: "^16.0.3",
              "js-base64": "^3.7.5",
            },
            devDependencies: {
              "@types/jest": "^29.4.1",
              "@types/node": "^18.13.0",
              "deven-documentation-skeleton": "^2.0.0",
              moment: "^2.29.4",
              netlify: "^13.1.2",
              "netlify-cli": "^13.0.1",
              ramda: "^0.28.0",
              semver: "^7.3.8",
              signale: "^1.4.0",
              "ts-jest": "^29.0.5",
            },
          },
        },
        dataEventSignature: DataEventSignature.WorkflowJob,
        metricsSignature: MetricsSignature.WorkflowJob,
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
      expect(
        output?.filter(
          (out) => out.metricsSignature === MetricsSignature.WorkflowJob
        )
      ).toMatchSnapshot(`workflow_job fixture[${i}] OUTPUT`);
    });
  });
});
