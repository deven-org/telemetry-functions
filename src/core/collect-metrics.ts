import cloneDeep from "lodash.clonedeep";
import metricsConditions from "../metrics-conditions";
import { LogSuccess, LogWarnings } from "../shared/log-messages";
import { MetricData, SignedTriggerEvent } from "../interfaces";
import { ErrorForLogger, ErrorLevel } from "./error-logger";
import { logger } from "./logger";

export const collectMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData[]> => {
  const collectedMetrics: MetricData[] = [];

  for (const [condition, collect] of metricsConditions) {
    const clonedTriggerEvent = cloneDeep(triggerEvent);
    if (condition(clonedTriggerEvent)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const metrics = await collect(clonedTriggerEvent);
      collectedMetrics.push(metrics);
      logger.success(LogSuccess.metricsCollected, metrics.metric_signature);
    }
  }

  if (collectedMetrics.length === 0) {
    throw new ErrorForLogger(
      ErrorLevel.Skip,
      LogWarnings.collectMetricsSignatureNotRecognized
    );
  }

  return collectedMetrics;
};
