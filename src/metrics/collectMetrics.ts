import {
  DataEvent,
  DataEventSignature,
  EnhancedDataEvent,
  ErrorForCatcher,
  getRejectionReason,
  logger,
} from "../core";
import { cond, T, always, clone, pipe, omit } from "ramda";
import { collectPackagesMetrics } from "./packages";
import { collectMergedPrMetrics } from "./prs";
import { LogErrors, LogInfos } from "../shared/logMessages";

const isSignedAsPackages = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.Packages;

const isSignedAsMergedPr = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.MergedPR;

const collectMetricsBySignature = cond([
  [isSignedAsPackages, collectPackagesMetrics],
  [isSignedAsMergedPr, collectMergedPrMetrics],
  [T, always(undefined)],
]);

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
