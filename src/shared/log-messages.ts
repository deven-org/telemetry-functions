export enum LogErrors {
  collectMetricsSignatureNotRecognized = "No collect-metrics function found for this event.",
  wrongResolvedEnhancedEvents = "Enhanced Events are invalid.",
  networkErrorCommitsPerPR = "Could not fetch commits for PR-Id: '%s'",
  networkErrorDeployments = "Could not fetch deployments for owner/repo/env: '%s'",
  networkErrorPackageJson = "Could not fetch package.json for owner/repo: '%s'",
  networkErrorDocumentationSkeletonConfig = "Could not fetch documentation-skeleton-config.json for owner/repo: '%s'",
  releaseVersionsUnexpectedInvalidVersion = "Unexpected invalid Release Version",
  genericServerError = "Server Error - Check the logs",
  couldNotStoreData = "The following data could not be stored (see previous logs for detailed errors): '%s'",
  envVarRequired = "Required environment variable is not set: '%s'",
  envVarNotANumber = "Environment variable is set but not parsable as an integer: '%s'",
  envVarUnsafeInt = "Environment variable is set but not parsable as a safe integer: '%s'",
  dataRepoNoReadAccess = "The data repository could not be accessed (status: '%s'). If the repo exists, this can mean that the REPO_WRITE_ACCESS_TOKEN has no read (and write) permissions for the repo",
  dataRepoNoWriteAccess = "Could not write to repo (status: '%s'). Likely missing write permissions for the data repo using REPO_WRITE_ACCESS_TOKEN",
}

export enum LogInfos {
  eventReceived = "Received '%s' event",
  eventSigned = "Event has been signed as: '%s'",
  startCollectingMetrics = "Trying to collect metrics...",
  storeDataCheckingHead = "Store data failed, but we may try again. Fetching repo HEAD to check if we should retry storing data…",
  storeDataRetrying = "HEAD of data repo changed, retrying to store data...",
}

export enum LogWarnings {
  signingEventSignatureNotRecognized = "It is not possible to add a signature to the event.",
  collectMetricsSignatureNotRecognized = "It is not possible to collect metrics from this event.",
  documentationSkeletonConfigNotFound = "No documentation skeleton config file found. Owner/Repo is: '%s'",
  documentationSkeletonConfigNotParsable = "Could not parse content of documentation skeleton config for owner/repo: '%s'",
  documentationSkeletonConfigNonStringVersion = "Focumentation skeleton config version field does not contain string. Owner/Repo is: '%s'",
  rootPackageJsonNotFound = "No root package.json file found. Owner/Repo is: '%s'",
  rootPackageJsonNotParsable = "Could not parse content of package.json for owner/repo: '%s'",
  rootPackageJsonNonStringVersion = "Root package.json version field does not contain string. Owner/Repo is: '%s'",
  repoIsDatabaseRepo = "This event came from the telemetry database repository itself, skipping",
  storeDataConflictRetriesMaximumReached = "Reached the maximum amount of retries due to conflicts while trying to store data: '%s'",
  storeDataNotAConflict = "Not retrying to store data, because HEAD has not changed in the meantime - Error must be something else!",
}

export enum LogSuccess {
  metricsCollected = "Metrics have been collected for: %s.",
}
