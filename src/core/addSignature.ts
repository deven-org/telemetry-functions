import {
  createDataEvent,
  DataEvent,
  DataEventSignature,
  Errors,
  getRejectionReason,
  logger,
} from ".";
import { cond, T, always, pipe, clone } from "ramda";
import { isPackages, isMergedPr } from "./signingConditions";
import { LogInfos } from "../shared/logMessages";

const createSignedDataEvent =
  (signature: DataEventSignature) => (data: any) => {
    logger.info(LogInfos.eventSigned, signature);

    return createDataEvent({
      dataEventSignature: signature,
      output: {},
      payload: data,
    });
  };

const signDataEvent = cond([
  [isPackages, createSignedDataEvent(DataEventSignature.Packages)],
  [isMergedPr, createSignedDataEvent(DataEventSignature.MergedPR)],
  [T, always(false)],
]);

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
