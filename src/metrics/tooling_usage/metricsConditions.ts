import { collectToolingUsageMetrics } from ".";
import {
  Conditions,
  SignedDataEvent,
  DataEventSignature,
} from "../../interfaces";

export const isSignedAsToolingUsage = (dataEvent: SignedDataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.ToolingUsage;

const conditions: Conditions = [
  [isSignedAsToolingUsage, collectToolingUsageMetrics],
];

export default conditions;
