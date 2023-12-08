export enum LogErrors {
  collectMetricsSignatureNotRecognized = "No collect-metrics function found for this event.",
  wrongResolvedEnhancedEvents = "Enhanced Events are invalid.",
  networkErrorCommitsPerPR = "Could not fetch commits for PR-Id: '%s'",
  networkErrorDeployments = "Could not fetch deployments for owner/repo/env: '%s'",
  networkErrorPackageJson = "Could not fetch package.json for owner/repo: '%s'",
  parseErrorPackageJson = "Could not parse content of package.json for owner/repo: '%s'",
  releaseVersionsUnexpectedInvalidVersion = "Unexpected invalid Release Version",
  genericServerError = "Server Error - Check the logs",
  couldNotStoreData = "The following data could not be stored (see previous logs for detailed errors): %s'",
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
}

export enum LogSuccess {
  metricsCollected = "Metrics have been collected for: %s.",
}
