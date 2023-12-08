import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import {
  TriggerEventSignature,
  SignedTriggerEvent,
  GithubEvent,
} from "../../../interfaces";
import { isSignedAsDeployment } from "../metrics-conditions";

describe("Deployment metric condition: isSignedAsDeployment", () => {
  it("returns false if event is not signed as Deployment", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubCheckSuite,
      payload: getWebhookEventFixture(GithubEvent.CheckSuite),
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns false if event is signed as Deployment but not with the action created", async () => {
    // There are no other actions for deployments, we'll invent one
    const fixture = getWebhookEventFixture(GithubEvent.Deployment);
    // @ts-expect-error the type is unhappy bc it only knows the "created" action.
    fixture.action = "deployed";

    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubDeployment,
      payload: fixture,
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns true if event is signed as Deployment with the action created", async () => {
    const event: SignedTriggerEvent = {
      trigger_event_signature: TriggerEventSignature.GithubDeployment,
      payload: getWebhookEventFixture(
        GithubEvent.Deployment,
        (ex) => ex.action === "created"
      ),
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeTruthy();
  });
});
