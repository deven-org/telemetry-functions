import { collectMetrics } from "./core/collectMetrics";
import { storeData } from "./core";
import { logger } from "./core/logger";
import { LogInfos } from "./shared/logMessages";
import { addSignature } from "./core/addSignature";

export const handler = async (event: any): Promise<any> => {
  logger.start(LogInfos.eventReceived);

  const signedEvent = await addSignature(event);
  const collectedMetrics = await collectMetrics(signedEvent);
  if (collectedMetrics.length > 0) {
    return await storeData(collectedMetrics);
  }
};
