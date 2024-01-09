import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { ErrorForLogger, ErrorLevel } from "../../../core/error-logger";
import { LogWarnings } from "../../../shared/log-messages";
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

  it("throws skip if event is from data repo", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.DevenToolingUsage,
      payload: {
        owner: "data-repo-owner",
        repo: "data-repo-name",
      },
      created_at: 100,
    };

    expect(() => isSignedAsToolingUsage(event)).toThrow(
      new ErrorForLogger(ErrorLevel.Skip, LogWarnings.repoIsDatabaseRepo)
    );
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
