import { collectToolingUsageMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsToolingUsage = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.ToolingUsage;

const conditions: Conditions = [
  [isSignedAsToolingUsage, collectToolingUsageMetrics],
];

export default conditions;
