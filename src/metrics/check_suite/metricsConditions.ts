import { collectCheckSuiteMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validateEventSignature";
import { CheckSuitePayload } from "./interfaces";

export const isSignedAsCheckSuiteCompleted = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.CheckSuite)) {
    return false;
  }

  if (dataEvent.payload.action !== "completed") {
    return false;
  }

  dataEvent.payload satisfies CheckSuitePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsCheckSuiteCompleted, collectCheckSuiteMetrics],
];

export default conditions;
