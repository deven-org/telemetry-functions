import { collectCodeReviewInvolvementMetrics } from ".";
import { CheckSuiteCompletedEvent } from "../../github.interfaces";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsCheckSuiteCompleted = (dataEvent: DataEvent) => {
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
  [isSignedAsCheckSuiteCompleted, collectCodeReviewInvolvementMetrics],
];

export default conditions;
