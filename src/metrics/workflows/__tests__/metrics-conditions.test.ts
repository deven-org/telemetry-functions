import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { TriggerEventSignature, SignedTriggerEvent } from "../../../interfaces";
import { isSignedAsWorkflowJob } from "../metrics-conditions";

describe("Workflows metric condition: isSignedAsWorkflowJob", () => {
  it("returns false if event is not signed as WorkflowJob", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("returns false if event is signed as WorkflowJob but not completed", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.WorkflowJob,
      payload: getWebhookEventFixture(
        "workflow_job",
        (ex) => ex.action !== "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed WorkflowJob", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.WorkflowJob,
      payload: getWebhookEventFixture(
        "workflow_job",
        (ex) => ex.action === "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeTruthy();
  });
});
