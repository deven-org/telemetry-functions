import { clean as semverClean } from "semver";
import { collectReleaseVersionsMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { ReleaseVersionsPayload } from "./interfaces";

export const isSignedAsTagCreateEvent = (dataEvent: SignedDataEvent) => {
  if (
    !validateEventSignature(dataEvent, DataEventSignature.TagOrBranchCreation)
  ) {
    return false;
  }

  if (dataEvent.payload.ref_type !== "tag") {
    return false;
  }

  if (semverClean(dataEvent.payload.ref, { loose: true }) === null) {
    return false;
  }

  dataEvent.payload satisfies ReleaseVersionsPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsTagCreateEvent, collectReleaseVersionsMetrics],
];

export default conditions;
