import { CheckSuiteCompletedEvent } from "../../github.interfaces.ts";
import { DataEvent, DataEventSignature } from "../../interfaces.ts";

export const isSignedAsCheckSuiteCompleted = (dataEvent: DataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.CheckSuite) {
    return false;
  } else {
  }

  if ((dataEvent.payload as CheckSuiteCompletedEvent).action !== "completed") {
    return false;
  }

  return true;
};
