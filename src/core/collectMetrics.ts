import { getRejectionReason } from ".";
import { logger } from "./logger";
import { clone, omit } from "ramda";
import metricsConditions from "../metricsConditions";

import { LogErrors, LogInfos } from "../shared/logMessages";
import { DataEvent, EnhancedDataEvent } from "../interfaces";

export const collectMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent[]> => {
  logger.info(LogInfos.startCollectingMetrics);

  const collectedMetrics: EnhancedDataEvent[] = [];

  for (const [condition, collect] of metricsConditions) {
    const clonedDataEvent = clone(dataEvent);
    if (condition(clonedDataEvent)) {
      collectedMetrics.push(omit(["payload"], await collect(clonedDataEvent)));
    }
  }

  if (collectedMetrics.length === 0) {
    throw getRejectionReason({
      level: "error",
      message: LogErrors.collectMetricsSignatureNotRecognized,
    });
  }

  return collectedMetrics;
};
