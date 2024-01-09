import {
  LogErrors,
  LogInfos,
  LogSuccess,
  LogWarnings,
} from "../shared/log-messages";
import { logger } from "./logger";

export enum ErrorLevel {
  Error = "error",
  Warn = "warn",
  Skip = "skip",
}

export class ErrorForLogger extends Error {
  level: ErrorLevel;
  params: unknown[] = [];

  constructor(
    level: ErrorLevel,
    message: LogErrors | LogInfos | LogSuccess | LogWarnings,
    ...params: unknown[]
  ) {
    super(message);
    this.level = level;
    this.params = params;
  }
}

export const errorLogger = (error: unknown) => {
  if (error instanceof ErrorForLogger) {
    logger[error.level](error.message, ...error.params);
  } else if (error instanceof Error) {
    logger.error(error); // log error name/message/stacktrace
    logger.info({ ...error }); // log extra data, e.g. http request
  } else if (Array.isArray(error)) {
    error.forEach((e) => errorLogger(e));
  } else {
    logger.error(error);
  }
};
