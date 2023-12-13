import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { ErrorForLogger } from "../../../core/error-logger";
import { LogWarnings } from "../../../shared/log-messages";
import { isSignedAsWorkflowJob } from "../metrics-conditions";

describe("Workflows metric condition: isSignedAsWorkflowJob", () => {
  it("returns false if event is not signed as WorkflowJob", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(GithubEvent.CheckSuite),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("throws skip if event is from data repo", async () => {
    const payload = getWebhookEventFixture(GithubEvent.WorkflowJob);
    payload.repository.full_name = "data-repo-owner/data-repo-name";

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
      payload,
      created_at: 100,
    };

    expect(() => isSignedAsWorkflowJob(event)).toThrow(
      new ErrorForLogger("skip", LogWarnings.repoIsDatabaseRepo)
    );
  });

  it("returns false if event is signed as WorkflowJob but not completed", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
      payload: getWebhookEventFixture(
        GithubEvent.WorkflowJob,
        (ex) => ex.action !== "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed WorkflowJob", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
      payload: getWebhookEventFixture(
        GithubEvent.WorkflowJob,
        (ex) => ex.action === "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeTruthy();
  });
});
