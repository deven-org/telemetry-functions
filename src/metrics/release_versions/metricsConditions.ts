import { collectReleaseVersionsMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { ReleaseVersionsPayload } from "./interfaces";

export const isSignedAsPullRequestClosed = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.PullRequest)) {
    return false;
  }

  if (dataEvent.payload.action !== "closed") {
    return false;
  }

  dataEvent.payload satisfies ReleaseVersionsPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsPullRequestClosed, collectReleaseVersionsMetrics],
];

export default conditions;
