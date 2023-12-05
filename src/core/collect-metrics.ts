import { getErrorForCatcher, logger } from ".";
import cloneDeep from "lodash.clonedeep";
import metricsConditions from "../metrics-conditions";
import { LogSuccess, LogWarnings } from "../shared/log-messages";
import { MetricData, SignedDataEvent } from "../interfaces";

export const collectMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData[]> => {
  const collectedMetrics: MetricData[] = [];

  for (const [condition, collect] of metricsConditions) {
    const clonedDataEvent = cloneDeep(dataEvent);
    if (condition(clonedDataEvent)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const metrics = await collect(clonedDataEvent);
      collectedMetrics.push(metrics);
      logger.success(LogSuccess.metricsCollected, metrics.metricsSignature);
    }
  }

  if (collectedMetrics.length === 0) {
    throw getErrorForCatcher({
      level: "skip",
      message: LogWarnings.collectMetricsSignatureNotRecognized,
    });
  }

  return collectedMetrics;
};
