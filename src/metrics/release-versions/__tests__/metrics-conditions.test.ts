import { clean as semverClean } from "semver";
import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { isSignedAsTagCreateEvent } from "../metrics-conditions";
import { ErrorForLogger } from "../../../core/error-logger";
import { LogWarnings } from "../../../shared/log-messages";

describe("Release Versions metric condition: isSignedAsTagCreateEvent", () => {
  it("returns false if event is not signed as create", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(GithubEvent.CheckSuite),
      created_at: 100,
    };

    expect(isSignedAsTagCreateEvent(event)).toBeFalsy();
  });

  it("throws skip if event is from data repo", async () => {
    const payload = getWebhookEventFixture(
      GithubEvent.TagOrBranchCreation,
      (ex) => ex.ref_type === "tag"
    );
    payload.repository.full_name = "data-repo-owner/data-repo-name";

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubTagOrBranchCreation,
      payload,
      created_at: 100,
    };

    expect(() => isSignedAsTagCreateEvent(event)).toThrow(
      new ErrorForLogger("skip", LogWarnings.repoIsDatabaseRepo)
    );
  });

  it("returns false if event is signed as create, ref_type is tag and ref is invalid semver string ", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubTagOrBranchCreation,
      payload: getWebhookEventFixture(
        GithubEvent.TagOrBranchCreation,
        (ex) => ex.ref_type === "tag" && semverClean(ex.ref) === null
      ),
      created_at: 100,
    };

    expect(isSignedAsTagCreateEvent(event)).toBeFalsy();
  });

  it("returns true if event is signed as tag Create and ref is valid semver string", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubTagOrBranchCreation,
      payload: getWebhookEventFixture(
        GithubEvent.TagOrBranchCreation,
        (ex) => ex.ref_type === "tag" && semverClean(ex.ref) !== null
      ),
      created_at: 100,
    };

    expect(isSignedAsTagCreateEvent(event)).toBeTruthy();
  });
});
