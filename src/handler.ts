import { collectMetrics } from "./core/collectMetrics";
import { storeData, errorCatcher } from "./core";
import { logger } from "./core/logger";
import { pipeWith } from "ramda";
import { LogErrors, LogInfos } from "./shared/logMessages";
import { addSignature } from "./core/addSignature";

const callOrThen = (fn: any, args: any) =>
  args.then ? args.then(fn) : fn(args);

export const handler = async (event: any): Promise<any> => {
  logger.start(LogInfos.eventReceived);

  const enhancedDataEvents = pipeWith(callOrThen, [
    addSignature,
    collectMetrics,
  ])(event).catch(errorCatcher);

  try {
    const resolvedEnhancedDataEvents = await enhancedDataEvents;
    if (resolvedEnhancedDataEvents) {
      return await storeData(await enhancedDataEvents);
    } else {
      logger.error(LogErrors.wrongResolvedEnhancedEvents);
    }
  } catch (e) {
    console.error(e);
  }
};
