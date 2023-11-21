import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsPullRequestMerged } from "../metricsConditions";
import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";

describe("Documentation Updated metric condition: isSignedAsPullRequestMerged", () => {
  it("returns false if event is not signed as PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsPullRequestMerged(event)).toBeFalsy();
  });

  it("returns false if event is a PullRequest but not closed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action !== "closed"
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestMerged(event)).toBeFalsy();
  });

  it("returns false if event is a closed PullRequest but not merged", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action === "closed" && !ex.pull_request.merged
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestMerged(event)).toBeFalsy();
  });

  it("returns true if event is a closed and merged PullRequest", async () => {
    const fixture = getWebhookEventFixture(
      "pull_request",
      (ex) => ex.action === "closed" && ex.pull_request.merged
    );

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      // there's no merged example yet, we'll have to get one from an unmerged one
      payload: fixture,
      created_at: 100,
    };

    expect(isSignedAsPullRequestMerged(event)).toBeTruthy();
  });
});
