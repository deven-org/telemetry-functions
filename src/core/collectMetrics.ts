import { getRejectionReason, logger } from ".";
import { clone, keys } from "ramda";
import metricsConditions from "../metricsConditions";
import Table from "cli-table3";

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

      const table = new Table({
        style: { head: ["cyan"] },
        head: [
          `Metrics: ${metrics.dataEventSignature} > ${metrics.metricsSignature}`,
        ],
        colWidths: [100],
      });
      for (const k of keys(metrics.output)) {
        table.push([k]);
      }
      collectedMetrics.push(metrics);
      logger.success(LogSuccess.metricsCollected, metrics.dataEventSignature);
      logger.info("\n" + table.toString());
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
