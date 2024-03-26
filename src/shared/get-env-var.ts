import { ErrorForLogger, ErrorLevel } from "../core/error-logger";
import { LogErrors } from "./log-messages";

export type KnownEnvironmentVariable =
  | "REPO_NAME"
  | "REPO_OWNER"
  | "REPO_PATH"
  | "REPO_BRANCH"
  | "CONFLICT_RETRIES"
  | "TARGET_BRANCH"
  | "REPO_WRITE_ACCESS_TOKEN"
  | "WEBHOOK_SECRET"
  | "GITHUB_ACCESS_TOKEN"
  | "COMMITTER_NAME"
  | "COMMITTER_EMAIL"
  | "AUTHOR_NAME"
  | "AUTHOR_EMAIL"
  | "STORE_DATA_STAGGER_TIMEOUT";

export class EnvVarAccessError extends ErrorForLogger {
  name = "EnvVarAccessError";

  static required(name): EnvVarAccessError {
    return new EnvVarAccessError(
      ErrorLevel.Error,
      LogErrors.envVarRequired,
      name
    );
  }

  static nan(name): EnvVarAccessError {
    return new EnvVarAccessError(
      ErrorLevel.Error,
      LogErrors.envVarNotANumber,
      name
    );
  }

  static unsafeInt(name): EnvVarAccessError {
    return new EnvVarAccessError(
      ErrorLevel.Error,
      LogErrors.envVarUnsafeInt,
      name
    );
  }
}

/**
 * tries to parse an environment variable as a number
 *
 * @throws {EnvVarAccessError} value must be parsable as a number
 */
function parseAsNumber(variable: string, name: string): number {
  const parsed = parseInt(variable, 10);

  if (Number.isNaN(parsed)) {
    throw EnvVarAccessError.nan(name);
  }

  if (!Number.isSafeInteger(parsed)) {
    throw EnvVarAccessError.unsafeInt(name);
  }

  return parsed;
}

/**
 * access an environment variable and return it
 * returns null if not set or empty
 */
export function getOptionalEnvVar(name: KnownEnvironmentVariable) {
  return process.env[name] || null;
}

/**
 * access and parse a numeric environment variable and return it
 * returns null if not set or empty
 *
 * @throws {EnvVarAccessError} value must be parsable as a number
 */
export function getOptionalNumericEnvVar(
  name: KnownEnvironmentVariable
): number | null {
  const value = getOptionalEnvVar(name);
  if (value !== null) {
    return parseAsNumber(value, name);
  }
  return null;
}

/**
 * access an environment variable and return it
 *
 * @throws {EnvVarAccessError} env var must be set
 */
export function getRequiredEnvVar(name: KnownEnvironmentVariable): string {
  const value = process.env[name];
  if (!value) {
    throw EnvVarAccessError.required(name);
  }
  return value;
}

/**
 * access and parse a numeric environment variable and return it
 *
 * @throws {EnvVarAccessError} value must be set and parsable as a number
 */
export function getRequiredNumericEnvVar(
  name: KnownEnvironmentVariable
): number {
  return parseAsNumber(getRequiredEnvVar(name), name);
}
