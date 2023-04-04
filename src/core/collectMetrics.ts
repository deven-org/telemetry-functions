import { getRejectionReason, logger } from ".";
import { clone } from "ramda";
import metricsConditions from "../metricsConditions";
import { LogSuccess, LogWarnings } from "../shared/logMessages";
import { DataEvent, EnhancedDataEvent } from "../interfaces";

export const collectMetrics = async (
  dataEvent: DataEvent
): Promise<EnhancedDataEvent[]> => {
  const collectedMetrics: EnhancedDataEvent[] = [];

  for (const [condition, collect] of metricsConditions) {
    const clonedDataEvent = clone(dataEvent);
    if (condition(clonedDataEvent)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { payload, ...metrics } = (await collect(
        clonedDataEvent
      )) as DataEvent;
      collectedMetrics.push(metrics);
      logger.success(LogSuccess.metricsCollected, metrics.metricsSignature);
    }
  }

  if (collectedMetrics.length === 0) {
    throw getRejectionReason({
      level: "skip",
      message: LogWarnings.collectMetricsSignatureNotRecognized,
    });
  }

  return collectedMetrics;
};
