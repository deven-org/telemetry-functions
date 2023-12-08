import { collectDeploymentMetrics } from ".";
import {
  Conditions,
  SignedTriggerEvent,
  TriggerEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { DeploymentPayload } from "./interfaces";

export const isSignedAsDeployment = (triggerEvent: SignedTriggerEvent) => {
  if (
    !validateEventSignature(
      triggerEvent,
      TriggerEventSignature.GithubDeployment
    )
  ) {
    return false;
  }

  if (triggerEvent.payload.action !== "created") {
    return false;
  }

  triggerEvent.payload satisfies DeploymentPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsDeployment, collectDeploymentMetrics],
];

export default conditions;
