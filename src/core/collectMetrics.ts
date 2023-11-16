import { getRejectionReason, logger } from ".";
import { clone } from "ramda";
import metricsConditions from "../metricsConditions";
import { LogSuccess, LogWarnings } from "../shared/logMessages";
import { MetricData, SignedDataEvent } from "../interfaces";

export const collectMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData[]> => {
  const collectedMetrics: MetricData[] = [];

  for (const [condition, collect] of metricsConditions) {
    const clonedDataEvent = clone(dataEvent);
    if (condition(clonedDataEvent)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const metrics = await collect(clonedDataEvent);
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
