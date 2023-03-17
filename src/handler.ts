import { collectMetrics } from "./metrics/collectMetrics";
import { storeData, errorCatcher } from "./core";
import { logger } from "./core/logger";
import { pipeWith, tap } from "ramda";
import { LogInfos } from "./shared/logMessages";
import { addSignature } from "./core/addSignature";

const callOrThen = (fn: any, args: any) =>
  args.then ? args.then(fn) : fn(args);

export const handler = async (event: any): Promise<any> => {
  logger.start(LogInfos.eventReceived);

  return pipeWith(callOrThen, [addSignature, collectMetrics, storeData])(
    event
  ).catch(errorCatcher);
};
