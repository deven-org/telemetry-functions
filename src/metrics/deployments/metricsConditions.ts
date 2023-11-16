import { collectDeploymentMetrics } from ".";
import { DeploymentCreatedEvent } from "../../github.interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

const isSignedAsDeployment = (dataEvent: SignedDataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.Deployment) {
    return false;
  }

  if ((dataEvent.payload as DeploymentCreatedEvent).action !== "created") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsDeployment, collectDeploymentMetrics],
];

export default conditions;
