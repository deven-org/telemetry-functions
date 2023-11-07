import moment from "moment";
// import { logger } from "./logger.ts";
import { DataEvent, DataEventSignature } from "../interfaces.ts";
import { LogInfos, LogWarnings } from "../shared/logMessages.ts";

export interface RawEvent {
  eventSignature: string;
  action?: string;
}
const createSignedDataEvent = (data: any) => {
  const signature = getDataEventSignature(data.eventSignature);
  // logger.info(LogInfos.eventSigned, signature);

  return {
    dataEventSignature: signature,
    metricsToApply: [],
    output: {},
    payload: data,
    created_at: moment().valueOf(),
    owner: "",
    repo: "",
  };
};

const getDataEventSignature = (eventSignature: string): DataEventSignature => {
  switch (eventSignature) {
    case "toolingUsage":
      return DataEventSignature.ToolingUsage;
    case "workflow_job":
      return DataEventSignature.WorkflowJob;
    case "pull_request":
      return DataEventSignature.PullRequest;
    case "check_suite":
      return DataEventSignature.CheckSuite;
    case "deployment":
      return DataEventSignature.Deployment;
    default:
      throw new Error("Missing event signature in raw event data");
  }
};

export const addSignature = (data: RawEvent): Promise<DataEvent> => {
  return new Promise((res, rej) => {
    const signedDataEvent = createSignedDataEvent(data);

    signedDataEvent
      ? res(signedDataEvent)
      : rej({
          level: "skip",
          message: LogWarnings.signingEventSignatureNotRecognized,
        });
  });
};
