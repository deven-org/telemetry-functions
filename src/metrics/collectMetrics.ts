import { getRejectionReason } from "../core";
import { logger } from "../core/logger";
import { cond, clone, pipe, omit } from "ramda";
import metricsConditions from "../metricsConditions";

import { LogErrors, LogInfos } from "../shared/logMessages";
import { DataEvent, EnhancedDataEvent } from "../interfaces";

const collectMetricsBySignature = cond(
  metricsConditions.map((cond) => [cond[0], cond[1]])
);

export const collectMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent> => {
  logger.info(LogInfos.startCollectingMetrics);

  const dataEventWithMetrics = pipe(
    clone,
    await collectMetricsBySignature
  )(dataEvent);
  if (!dataEventWithMetrics) {
    throw getRejectionReason({
      level: "error",
      message: LogErrors.collectMetricsSignatureNotRecognized,
    });
  }
  return omit(["payload"], await dataEventWithMetrics);
};
