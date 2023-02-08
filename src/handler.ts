import { collectMetrics } from "./metrics/collectMetrics";
import { storeData, addSignature, logger, errorCatcher } from "./core";
import { pipeWith, tap } from "ramda";
import { LogInfos } from "./shared/logMessages";

const callOrThen = (fn: any, args: any) =>
  args.then ? args.then(fn) : fn(args);

export const handler = async (event: any) => {
  logger.start(LogInfos.eventReceived);

  return pipeWith(callOrThen, [addSignature, collectMetrics, storeData])(
    event
  ).catch(errorCatcher);
};
