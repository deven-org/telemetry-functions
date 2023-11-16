import { collectCheckSuiteMetrics } from ".";
import { CheckSuiteCompletedEvent } from "../../github.interfaces";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

const isSignedAsCheckSuiteCompleted = (dataEvent: SignedDataEvent) => {
  if (dataEvent.dataEventSignature !== DataEventSignature.CheckSuite) {
    return false;
  } else {
  }

  if ((dataEvent.payload as CheckSuiteCompletedEvent).action !== "completed") {
    return false;
  }

  return true;
};

const conditions: Conditions = [
  [isSignedAsCheckSuiteCompleted, collectCheckSuiteMetrics],
];

export default conditions;
