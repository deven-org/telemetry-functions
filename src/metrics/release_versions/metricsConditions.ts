import { PullRequestClosedEvent } from "../../github.interfaces.ts";
import { DataEvent, DataEventSignature } from "../../interfaces.ts";

export const isSignedAsReleaseVersion = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.PullRequest) {
    return false;
  } else {
  }

  if ((dataEvent.payload as PullRequestClosedEvent).action !== "closed") {
    return false;
  }

  return true;
};
