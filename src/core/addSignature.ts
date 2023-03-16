import { createDataEvent, Errors, getRejectionReason, logger } from ".";
import { cond, T, always, pipe, clone } from "ramda";
import { isWorkflowJobCompleted } from "./signingConditions";
import { LogInfos } from "../shared/logMessages";
import { DataEventSignature, DataEvent } from "../interfaces";
import { isPullRequestClosed } from "../metrics/pull_requests/signatureConditions";
import signatureConditions from "../signatureConditions";

const createSignedDataEvent =
  (signature: DataEventSignature) => (data: any) => {
    logger.info(LogInfos.eventSigned, signature);

    return createDataEvent({
      dataEventSignature: signature,
      output: {},
      payload: data,
    });
  };

const signDataEvent = cond(
  signatureConditions.map((cond) => [
    cond[0],
    createSignedDataEvent(cond[1] as DataEventSignature),
  ])
);

export const addSignature = (data: any): Promise<DataEvent> => {
  return new Promise((res, rej) => {
    const signedDataEvent = pipe(clone, signDataEvent)(data);
    signedDataEvent
      ? res(signedDataEvent)
      : rej(
          getRejectionReason({
            level: "warn",
            message: Errors.signingEventSignatureNotRecognized,
          })
        );
  });
};
