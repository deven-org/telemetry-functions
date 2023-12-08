import { collectMetrics } from "./core/collect-metrics";
import { errorCatcher, ErrorForCatcher, storeData } from "./core";
import { logger } from "./core/logger";
import { LogInfos } from "./shared/log-messages";
import { addSignature } from "./core/add-signature";
import { MetricData, RawEvent } from "./interfaces";

export const handler = async (
  event: RawEvent
): Promise<undefined | MetricData[]> => {
  logger.start(
    LogInfos.eventReceived,
    `${event.source}::${event.sourceEventSignature}`
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
