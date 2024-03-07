import { collectMetrics } from "./core/collect-metrics";
import { storeData } from "./core";
import { logger } from "./core/logger";
import { LogInfos } from "./shared/log-messages";
import { addSignature } from "./core/add-signature";
import { MetricData, RawEvent } from "./interfaces";
import { ErrorForLogger, errorLogger } from "./core/error-logger";

export const handler = async (
  event: RawEvent,
  githubAccessTokenSourceRepo?: string,
  githubAccessTokenDataRepo?: string
): Promise<undefined | MetricData[]> => {
  logger.start(
    LogInfos.eventReceived,
    `${event.source}::${event.sourceEventSignature}`
  );

  try {
    const signedEvent = await addSignature(event);

    const collectedMetrics = await collectMetrics(
      signedEvent,
      githubAccessTokenSourceRepo
    );

    if (collectedMetrics.length > 0) {
      return await storeData(collectedMetrics, githubAccessTokenDataRepo);
    }
  } catch (e: unknown) {
    errorLogger(e);

    // Don't propagate non-error throws, i.e. "skip"
    const nonError = e instanceof ErrorForLogger && e.level !== "error";

    if (!nonError) {
      throw e;
    }
  }
};
