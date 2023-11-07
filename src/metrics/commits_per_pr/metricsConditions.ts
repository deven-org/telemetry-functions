import { DataEvent, DataEventSignature } from "../../interfaces.ts";
import { PullRequestClosedEvent } from "./../../github.interfaces.ts";

export const isSignedAsCommitsPerPr = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.PullRequest) {
    return false;
  }

  if ((dataEvent.payload as PullRequestClosedEvent).action !== "closed") {
    return false;
  }

  return true;
};
