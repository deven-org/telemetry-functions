import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { ErrorForLogger, ErrorLevel } from "../../../core/error-logger";
import { LogWarnings } from "../../../shared/log-messages";
import { isSignedAsCheckSuiteCompleted } from "../metrics-conditions";

describe("Check Suite metric condition: isSignedAsCheckSuiteCompleted", () => {
  it("returns false if event is not signed as CheckSuite", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      payload: getWebhookEventFixture(GithubEvent.PullRequest),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeFalsy();
  });

  it("throws skip if event is from data repo", async () => {
    const payload = getWebhookEventFixture(GithubEvent.CheckSuite);
    payload.repository.full_name = "data-repo-owner/data-repo-name";

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload,
      created_at: 100,
    };

    expect(() => isSignedAsCheckSuiteCompleted(event)).toThrow(
      new ErrorForLogger(ErrorLevel.Skip, LogWarnings.repoIsDatabaseRepo)
    );
  });

  it("returns false if event is signed as CheckSuite but not completed", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(
        GithubEvent.CheckSuite,
        (ex) => ex.action !== "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed CheckSuite", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(
        GithubEvent.CheckSuite,
        (ex) => ex.action === "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeTruthy();
  });
});
