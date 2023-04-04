import { collectMetrics } from "./core/collectMetrics";
import { errorCatcher, ErrorForCatcher, storeData } from "./core";
import { logger } from "./core/logger";
import { LogInfos } from "./shared/logMessages";
import { addSignature } from "./core/addSignature";
import { RawEvent } from "./interfaces";

export const handler = async (event: RawEvent): Promise<any> => {
  const actionLog = (action: string | undefined): string =>
    action ? ` (action: "${action}") ` : "";

  logger.start(
    LogInfos.eventReceived,
    `${event.eventSignature}${actionLog(event.action)}` || "unknown"
  );

  try {
    const signedEvent = await addSignature(event);

    const collectedMetrics = await collectMetrics(signedEvent);

    if (collectedMetrics.length > 0) {
      return await storeData(collectedMetrics);
    }
  } catch (e) {
    errorCatcher(e as ErrorForCatcher);
  }
};
