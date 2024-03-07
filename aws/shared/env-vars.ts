// Environment variables which contain name of parameters in AWS Systems Manager
// Name of parameter in Systems Manager which contains the Github webhook secret token
export const GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME =
  "GITHUB_WEBHOOK_SECRET_PARAM";

// Name of parameter which contains the Github access token of source repository
export const GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME =
  "SOURCE_REPO_ACCESS_TOKEN_PARAM";

// Name of parameter which contains the Github access token of data repository
export const GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME =
  "DATA_REPO_ACCESS_TOKEN_PARAM";
