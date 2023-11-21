import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsPullRequestClosed } from "../metricsConditions";

describe("Release Versions metric condition: isSignedAsPullRequestClosed", () => {
  it("returns false if event is not signed as PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeFalsy();
  });

  it("returns false if event is signed as PullRequest but not closed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action !== "closed"
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeFalsy();
  });

  it("returns true if event is signed as closed PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action === "closed"
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeTruthy();
  });
});
