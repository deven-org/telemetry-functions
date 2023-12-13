export enum LogErrors {
  collectMetricsSignatureNotRecognized = "No collect-metrics function found for this event.",
  wrongResolvedEnhancedEvents = "Enhanced Events are invalid.",
  networkErrorCommitsPerPR = "Could not fetch commits for PR-Id: '%s'",
  networkErrorDeployments = "Could not fetch deployments for owner/repo/env: '%s'",
  networkErrorPackageJson = "Could not fetch package.json for owner/repo: '%s'",
  parseErrorPackageJson = "Could not parse content of package.json for owner/repo: '%s'",
  releaseVersionsUnexpectedInvalidVersion = "Unexpected invalid Release Version",
  genericServerError = "Server Error - Check the logs",
  couldNotStoreData = "The following data could not be stored (see previous logs for detailed errors): '%s'",
  envVarRequired = "Required environment variable is not set: '%s'",
  envVarNotANumber = "Environment variable is set but not parsable as an integer: '%s'",
  envVatUnsafeInt = "Environment variable is set but not parsable as a safe integer: '%s'",
  dataRepoNoReadAccess = "The data repository could not be accessed (status: '%s'). If the repo exists, this can mean that the REPO_WRITE_ACCESS_TOKEN has no read (and write) permissions for the repo",
  dataRepoNoWriteAccess = "Could not write to repo (status: '%s'). Likely missing write permissions for the data repo using REPO_WRITE_ACCESS_TOKEN",
}

export enum LogInfos {
  eventReceived = "Received '%s' event",
  eventSigned = "Event has been signed as: '%s'",
  startCollectingMetrics = "Trying to collect metrics...",
}

export enum LogWarnings {
  signingEventSignatureNotRecognized = "It is not possible to add a signature to the event.",
  collectMetricsSignatureNotRecognized = "It is not possible to collect metrics from this event.",
  documentationSkeletonConfigNotFound = "No documentation skeleton config file found. Owner/Repo is: '%s'",
  repoIsDatabaseRepo = "This event came from the telemetry database repository itself, skipping",
}

export enum LogSuccess {
  metricsCollected = "Metrics have been collected for: %s.",
}
