import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsDeployment } from "../metricsConditions";

describe("Deployment metric condition: isSignedAsDeployment", () => {
  it("returns false if event is not signed as Deployment", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns false if event is signed as Deployment but not with the action created", async () => {
    // There are no other actions for deployments, we'll invent one
    const fixture = getWebhookEventFixture("deployment");
    // @ts-expect-error the type is unhappy bc it only knows the "created" action.
    fixture.action = "deployed";

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.Deployment,
      payload: fixture,
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns true if event is signed as Deployment with the action created", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.Deployment,
      payload: getWebhookEventFixture(
        "deployment",
        (ex) => ex.action === "created"
      ),
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeTruthy();
  });
});
