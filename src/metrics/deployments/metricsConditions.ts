import { collectDeploymentMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";
import { DeploymentPayload } from "./interfaces";

const isSignedAsDeployment = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.Deployment) {
    return false;
  }

  if ((dataEvent.payload as DeploymentPayload).action !== "created") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsDeployment, collectDeploymentMetrics],
];

export default conditions;
