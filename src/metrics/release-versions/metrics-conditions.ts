import { clean as semverClean } from "semver";
import { collectReleaseVersionsMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { ReleaseVersionsPayload } from "./interfaces";
import { abortIfDataRepo } from "../../shared/abort-if-data-repo";

export const isSignedAsTagCreateEvent = (triggerEvent: SignedTriggerEvent) => {
  if (
    !validateEventSignature(
      triggerEvent,
      TriggerEventSignature.GithubTagOrBranchCreation
    )
  ) {
    return false;
  }

  abortIfDataRepo(triggerEvent.payload.repository.full_name);

  if (triggerEvent.payload.ref_type !== "tag") {
    return false;
  }

  if (semverClean(triggerEvent.payload.ref, { loose: true }) === null) {
    return false;
  }

  triggerEvent.payload satisfies ReleaseVersionsPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsTagCreateEvent, collectReleaseVersionsMetrics],
];

export default conditions;
