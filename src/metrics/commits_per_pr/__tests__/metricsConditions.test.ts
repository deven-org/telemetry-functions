import { getWebhookEventFixture } from "../../../__tests__/fixtures/github-webhook-events";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsCommitsPerPr } from "../metricsConditions";

describe("Commits Per PR metric condition: isSignedAsCommitsPerPr", () => {
  it("returns false if event is not signed as PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: getWebhookEventFixture("check_suite"),
      created_at: 100,
    };

    expect(isSignedAsCommitsPerPr(event)).toBeFalsy();
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

    expect(isSignedAsCommitsPerPr(event)).toBeFalsy();
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

    expect(isSignedAsCommitsPerPr(event)).toBeFalsy();
  });

  it("returns true if event is signed as merged PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: getWebhookEventFixture(
        "pull_request",
        (ex) => ex.action === "closed" && ex.pull_request.merged
      ),
      created_at: 100,
    };

    expect(isSignedAsCommitsPerPr(event)).toBeTruthy();
  });
});
