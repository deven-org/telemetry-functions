import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { isSignedAsPullRequestClosed } from "../metrics-conditions";
import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { ErrorForLogger, ErrorLevel } from "../../../core/error-logger";
import { LogWarnings } from "../../../shared/log-messages";

describe("Code Review Involvement metric condition: isSignedAsPullRequestClosed", () => {
  it("returns false if event is not signed as PullRequest", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(GithubEvent.CheckSuite),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeFalsy();
  });

  it("throws skip if event is from data repo", async () => {
    const payload = getWebhookEventFixture(GithubEvent.PullRequest);
    payload.repository.full_name = "data-repo-owner/data-repo-name";

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      payload,
      created_at: 100,
    };

    expect(() => isSignedAsPullRequestClosed(event)).toThrow(
      new ErrorForLogger(ErrorLevel.Skip, LogWarnings.repoIsDatabaseRepo)
    );
  });

  it("returns false if event is signed as PullRequest but not closed", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      payload: getWebhookEventFixture(
        GithubEvent.PullRequest,
        (ex) => ex.action !== "closed"
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeFalsy();
  });

  it("returns true if event is a closed PullRequest but not merged", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      payload: getWebhookEventFixture(
        GithubEvent.PullRequest,
        (ex) => ex.action === "closed" && !ex.pull_request.merged
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeTruthy();
  });

  it("returns true if event is signed as closed PullRequest and merged", async () => {
    const fixture = getWebhookEventFixture(
      GithubEvent.PullRequest,
      (ex) => ex.action === "closed" && ex.pull_request.merged
    );

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubPullRequest,
      // there's no merged example yet, we'll have to get one from an unmerged one
      payload: fixture,
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeTruthy();
  });
});
