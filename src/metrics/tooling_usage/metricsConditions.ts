import { collectToolingUsageMetrics } from ".";
import { DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsToolingUsage = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.ToolingUsage;

export default [[isSignedAsToolingUsage, collectToolingUsageMetrics]];
