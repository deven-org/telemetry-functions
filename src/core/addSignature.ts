import { createDataEvent, getRejectionReason, logger } from ".";
import { cond, pipe, clone, T, always } from "ramda";
import { LogInfos, LogWarnings } from "../shared/logMessages";
import { DataEventSignature, SignedDataEvent, RawEvent } from "../interfaces";
import signatureConditions from "../signatureConditions";

const createSignedDataEvent =
  (signature: DataEventSignature) => (data: any) => {
    logger.info(LogInfos.eventSigned, signature);

    return createDataEvent({
      dataEventSignature: signature,
      payload: data,
    });
  };

const signDataEvent = cond([
  ...signatureConditions.map((item) => [
    item[0],
    createSignedDataEvent(item[1]),
  ]),
  [T, always(false)],
]);

export const addSignature = (data: RawEvent): Promise<SignedDataEvent> => {
  return new Promise((res, rej) => {
    const signedDataEvent = pipe(clone, signDataEvent)(data);

    signedDataEvent
      ? res(signedDataEvent)
      : rej(
          getRejectionReason({
            level: "skip",
            message: LogWarnings.signingEventSignatureNotRecognized,
          })
        );
  });
};
