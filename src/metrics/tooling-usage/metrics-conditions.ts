import { collectToolingUsageMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";
import { validateEventSignature } from "../../shared/validate-event-signature";
import { ToolingUsagePayload } from "./interfaces";

export const isSignedAsToolingUsage = (dataEvent: SignedDataEvent) => {
  if (!validateEventSignature(dataEvent, DataEventSignature.ToolingUsage)) {
    return false;
  }

  dataEvent.payload satisfies ToolingUsagePayload;

  return true;
};

const conditions: Conditions = [
  [isSignedAsToolingUsage, collectToolingUsageMetrics],
];

export default conditions;
