export const ERRORS = {
  invalidEvent: "The event is not valid",
  invalidRequest: "Invalid request: the body isn't a valid JSON string.",
  localEnvVarNotSet: "The environment variable {p} is not correctly set",
  invalidLocalEnvVar:
    "One ore more environment variables are not correctly set",
  skippingRepo: "This is a telemetry data repository, skipping",
  invalidDataObject: "The data object is not valid",
};

export const MANDATORY_ENV_VARS = [
  "REPO_NAME",
  "REPO_OWNER",
  "REPO_PATH",
  "TARGET_BRANCH",
  "GITHUB_ACCESS_TOKEN",
  "COMMITTER_NAME",
  "COMMITTER_EMAIL",
  "AUTHOR_NAME",
  "AUTHOR_EMAIL",
];
