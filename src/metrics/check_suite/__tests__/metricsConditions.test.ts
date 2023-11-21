import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsCheckSuiteCompleted } from "../metricsConditions";

describe("Check Suite metric condition: isSignedAsCheckSuiteCompleted", () => {
  it("returns false if event is not signed as CheckSuite", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture("pull_request"),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeFalsy();
  });

  it("returns false if event is signed as CheckSuite but not completed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture(
        "check_suite",
        (ex) => ex.action !== "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed CheckSuite", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture(
        "check_suite",
        (ex) => ex.action === "completed"
      ),
      created_at: 100,
    };

    expect(isSignedAsCheckSuiteCompleted(event)).toBeTruthy();
  });
});
