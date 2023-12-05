import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsWorkflowJobTestCoverage } from "../metrics-conditions";

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

  it("returns false if event is signed as completed WorkflowJob but no name is about tests", async () => {
    const payload = getWebhookEventFixture(
      "workflow_job",
      (ex) => ex.action === "completed" && ex.workflow_job.steps.length > 0
    );

    payload.workflow_job.name = "nothing";
    payload.workflow_job.workflow_name = "nothing";
    for (const step of payload.workflow_job.steps) {
      step.name = "nothing";
    }

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: payload,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed WorkflowJob and job name is about tests", async () => {
    const payload = getWebhookEventFixture(
      "workflow_job",
      (ex) => ex.action === "completed"
    );

    payload.workflow_job.name = "run tests";
    payload.workflow_job.workflow_name = "nothing";
    for (const step of payload.workflow_job.steps) {
      step.name = "nothing";
    }

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: payload,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeTruthy();
  });

  it("returns true if event is signed as completed WorkflowJob and the workflow name is about tests", async () => {
    const payload = getWebhookEventFixture(
      "workflow_job",
      (ex) => ex.action === "completed"
    );

    payload.workflow_job.name = "nothing";
    payload.workflow_job.workflow_name = "e2e testing";
    for (const step of payload.workflow_job.steps) {
      step.name = "nothing";
    }

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: payload,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeTruthy();
  });

  it("returns true if event is signed as completed WorkflowJob and a step name is about tests", async () => {
    const payload = getWebhookEventFixture(
      "workflow_job",
      (ex) => ex.action === "completed" && ex.workflow_job.steps.length > 0
    );

    payload.workflow_job.name = "nothing";
    payload.workflow_job.workflow_name = "nothing";
    for (const step of payload.workflow_job.steps) {
      step.name = "nothing";
    }
    payload.workflow_job.steps[0].name = "run jest";

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: payload,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJobTestCoverage(event)).toBeTruthy();
  });
});
