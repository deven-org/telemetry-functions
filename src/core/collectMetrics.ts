import { logger } from ".";
import { metrics } from "../metrics";
import { LogSuccess, LogWarnings } from "../shared/logMessages";
import { CheckedMetricsDataEvent, MetricData } from "../interfaces";

export const collectMetrics = async (
  dataEvent: CheckedMetricsDataEvent
): Promise<MetricData[]> => {
  Object.freeze(dataEvent);
  const collectedMetricData: MetricData[] = [];

  for (const metric of dataEvent.metricsToApply) {
    const collectFn = metrics[metric];
    const metricData = await collectFn(dataEvent);
    collectedMetricData.push(metricData);
    logger.success(LogSuccess.metricsCollected, metricData.metricsSignature);
  }

  if (collectedMetricData.length === 0) {
    throw {
      level: "skip",
      message: LogWarnings.collectMetricsSignatureNotRecognized,
    };
  }

  return collectedMetricData;
};
