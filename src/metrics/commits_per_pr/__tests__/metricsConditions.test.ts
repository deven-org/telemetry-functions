import { PullRequestClosedEvent } from "../../../github.interfaces";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsCommitsPerPr } from "../metricsConditions";

describe("Commits Per PR metric condition: isSignedAsCommitsPerPr", () => {
  it("returns false if event is not signed as PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: {} as PullRequestClosedEvent,
      created_at: 100,
    };

    expect(isSignedAsCommitsPerPr(event)).toBeFalsy();
  });

  it("returns false if event is signed as PullRequest but not closed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: {} as PullRequestClosedEvent,
      created_at: 100,
    };

    expect(isSignedAsCommitsPerPr(event)).toBeFalsy();
  });

  it("returns true if event is signed as closed PullRequest", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.PullRequest,
      payload: {
        action: "closed",
      } as PullRequestClosedEvent,
      created_at: 100,
    };

    expect(isSignedAsCommitsPerPr(event)).toBeTruthy();
  });
});
