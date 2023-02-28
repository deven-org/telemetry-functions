export const ERRORS = {
  invalidEvent: "The event is not valid",
  invalidRequest: "Invalid request: the body isn't a valid JSON string.",
  localEnvVarNotSet: "The environment variable {p} is not correctly set",
};

export const MANDATORY_ENV_VARS = [
  "REPO_NAME",
  "REPO_OWNER",
  "REPO_PATH",
  "TARGET_BRANCH",
  "GITHUB_ACCESS_TOKEN",
  "COMMITER_NAME",
  "COMMITER_EMAIL",
  "AUTHOR_NAME",
  "AUTHOR_EMAIL",
];
