import { logger } from "./logger";

export enum Errors {
  collectMetricsSignatureNotRecognized = "The signature of the data event is not recognized.",
  signingEventSignatureNotRecognized = "Can't identify the signature of the data event. Skipping.",
}

export interface ErrorForCatcher {
  level: "error" | "warn";
  message: string;
}

export const getRejectionReason = (error: ErrorForCatcher): ErrorForCatcher =>
  error;

export const errorCatcher = (error: ErrorForCatcher) => {
  if (!error.level) {
    logger.error(error);
  } else {
    logger[error.level](error.message);
  }
};
