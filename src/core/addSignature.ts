import { getErrorForCatcher, logger } from ".";
import { cond, pipe, clone, T, always } from "ramda";
import { LogInfos, LogWarnings } from "../shared/logMessages";
import { DataEventSignature, SignedDataEvent, RawEvent } from "../interfaces";
import signatureConditions from "../signatureConditions";

const createSignedDataEvent =
  (signature: DataEventSignature) => (data: unknown) => {
    logger.info(LogInfos.eventSigned, signature);

    return {
      dataEventSignature: signature,
      payload: data,
      created_at: Date.now(),
    };
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
          getErrorForCatcher({
            level: "skip",
            message: LogWarnings.signingEventSignatureNotRecognized,
          })
        );
  });
};
