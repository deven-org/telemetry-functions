import { DataEvent, DataEventSignature } from "../../interfaces.ts";
import { DeploymentCreatedEvent } from "../../github.interfaces.ts";

export const isSignedAsDeployment = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.Deployment) {
    return false;
  }

  if ((dataEvent.payload as DeploymentCreatedEvent).action !== "created") {
    return false;
  }

  return true;
};
