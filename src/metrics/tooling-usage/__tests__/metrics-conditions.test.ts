import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { ToolingUsagePayload } from "../interfaces";
import { isSignedAsToolingUsage } from "../metrics-conditions";

describe("Tooling Usage metric condition: isSignedAsToolingUsage", () => {
  it("returns false if event is not signed as ToolingUsage", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
      payload: getWebhookEventFixture(GithubEvent.WorkflowJob),
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeFalsy();
  });

  it("returns true if event is signed as ToolingUsage", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
      payload: {} as ToolingUsagePayload,
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeTruthy();
  });
});
