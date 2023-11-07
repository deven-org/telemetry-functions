import { DataEvent, DataEventSignature } from "../../interfaces.ts";

export const isSignedAsToolingUsage = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.ToolingUsage;
