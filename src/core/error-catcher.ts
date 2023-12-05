import {
  LogErrors,
  LogInfos,
  LogSuccess,
  LogWarnings,
} from "../shared/log-messages";
import { logger } from "./logger";

type ErrorLevel = "error" | "warn" | "skip";

export interface ErrorForCatcher {
  level: ErrorLevel;
  message: LogErrors | LogInfos | LogSuccess | LogWarnings;
}

export const getErrorForCatcher = (error: ErrorForCatcher): ErrorForCatcher =>
  error;

export const errorCatcher = (error: ErrorForCatcher) => {
  if (!error.level) {
    logger.error(error);
  } else {
    logger[error.level](error.message);
  }
};
