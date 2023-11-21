import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsPullRequestClosed } from "../metricsConditions";
import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";

describe("Code Review Involvement metric condition: isSignedAsPullRequestClosed", () => {
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

  it("returns false if event is a closed PullRequest but not merged", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action === "closed" && !ex.pull_request.merged
      ),
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeFalsy();
  });

  it("returns true if event is signed as closed PullRequest and merged", async () => {
    // There's no merged example data yet, we'll have to craft one

    const fixture = getWebhookEventFixture(
      "pull_request",
      (ex) => ex.action === "closed" && !ex.pull_request.merged
    );

    // there's no merged example yet, we'll have to make one from an unmerged one
    fixture.pull_request.merged = true;
    fixture.pull_request.merged_at = fixture.pull_request.closed_at;
    fixture.pull_request.merged_by = fixture.pull_request.user;

    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      // there's no merged example yet, we'll have to get one from an unmerged one
      payload: fixture,
      created_at: 100,
    };

    expect(isSignedAsPullRequestClosed(event)).toBeTruthy();
  });
});
