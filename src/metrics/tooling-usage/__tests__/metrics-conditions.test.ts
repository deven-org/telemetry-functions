import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { TriggerEventSignature, SignedTriggerEvent } from "../../../interfaces";
import { ToolingUsagePayload } from "../interfaces";
import { isSignedAsToolingUsage } from "../metrics-conditions";

describe("Tooling Usage metric condition: isSignedAsToolingUsage", () => {
  it("returns false if event is not signed as ToolingUsage", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.WorkflowJob,
      payload: getWebhookEventFixture("workflow_job"),
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeFalsy();
  });

  it("returns true if event is signed as ToolingUsage", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.ToolingUsage,
      payload: {} as ToolingUsagePayload,
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeTruthy();
  });
});
