import { getErrorForCatcher, logger } from ".";
import { LogInfos, LogWarnings } from "../shared/logMessages";
import { SignedDataEvent, RawEvent } from "../interfaces";
import { identifyTriggerEventSignature } from "../trigger-signatures";

export async function addSignature(data: RawEvent): Promise<SignedDataEvent> {
  const { payload, source, sourceEventSignature } = data;

  const signature = identifyTriggerEventSignature(source, sourceEventSignature);

  if (signature === null) {
    throw getErrorForCatcher({
      level: "skip",
      message: LogWarnings.signingEventSignatureNotRecognized,
    });
  }

  logger.info(LogInfos.eventSigned, signature);

  return {
    dataEventSignature: signature,
    created_at: Date.now(),
    // Note!
    // There is no runtime check for this assertion. It's a central point of
    // unsafety for us - we assume that the data matches what we expect, if
    // we were able to identify the signature.
    payload: payload as SignedDataEvent["payload"],
  };
}
