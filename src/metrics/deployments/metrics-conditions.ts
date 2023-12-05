import { collectDeploymentMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { DeploymentPayload } from "./interfaces";

export const isSignedAsDeployment = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.Deployment)) {
    return false;
  }

  if (dataEvent.payload.action !== "created") {
    return false;
  }

  dataEvent.payload satisfies DeploymentPayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsDeployment, collectDeploymentMetrics],
];

export default conditions;
