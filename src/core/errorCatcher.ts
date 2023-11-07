import { logger } from "./logger";

export interface ErrorForCatcher {
  level: "error" | "warn" | "skip";
  message: string;
}

export const errorCatcher = (error: ErrorForCatcher) => {
  if (!error.level) {
    logger.error(error);
  } else {
    logger[error.level](error.message);
  }
};
