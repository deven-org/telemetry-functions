import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsWorkflowJobTestCoverage } from "../metricsConditions";

describe("Test Coverage metric condition: isSignedAsWorkflowJobTestCoverage", () => {
  it("returns false if event is not signed as WorkflowJob", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeFalsy();
  });

  it("returns false if event is signed as WorkflowJob but not completed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: getWebhookEventFixture(
        "workflow_job",
        (ex) => ex.action !== "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed WorkflowJob", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: getWebhookEventFixture(
        "workflow_job",
        (ex) => ex.action === "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeTruthy();
  });
});
