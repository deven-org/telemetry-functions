import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { ToolingUsagePayload } from "../interfaces";
import { isSignedAsToolingUsage } from "../metrics-conditions";

describe("Tooling Usage metric condition: isSignedAsToolingUsage", () => {
  it("returns false if event is not signed as ToolingUsage", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: getWebhookEventFixture("workflow_job"),
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeFalsy();
  });

  it("returns true if event is signed as ToolingUsage", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.ToolingUsage,
      payload: {} as ToolingUsagePayload,
      created_at: 100,
    };

    expect(isSignedAsToolingUsage(event)).toBeTruthy();
  });
});
