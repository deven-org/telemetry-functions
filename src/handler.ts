import { collectMetrics } from "./core/collectMetrics";
import { errorCatcher, ErrorForCatcher, storeData } from "./core";
import { logger } from "./core/logger";
import { LogInfos } from "./shared/logMessages";
import { addSignature } from "./core/addSignature";

export const handler = async (event: any): Promise<any> => {
  const actionType = event?.action ? ` (action: "${event.action}") ` : "";

  logger.start(
    LogInfos.eventReceived,
    `${event.eventSignature}${actionType}` || "unknown"
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
