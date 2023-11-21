import { collectCommitsPerPrMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { CommitsPerPrPayload } from "./interfaces";

export const isSignedAsCommitsPerPr = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.PullRequest)) {
    return false;
  }

  if (dataEvent.payload.action !== "closed") {
    return false;
  }

  dataEvent.payload satisfies CommitsPerPrPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsCommitsPerPr, collectCommitsPerPrMetrics],
];

export default conditions;
