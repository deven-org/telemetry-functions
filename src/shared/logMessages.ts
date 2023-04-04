export enum LogErrors {
  collectMetricsSignatureNotRecognized = "No collect-metrics function found for this event.",
  wrongResolvedEnhancedEvents = "Enhanced Events are invalid.",
}

export enum LogInfos {
  eventReceived = "Received '%s' event",
  eventSigned = "Event has been signed as: '%s'",
  startCollectingMetrics = "Trying to collect metrics...",
}

export enum LogWarnings {
  invalidPackageJson = "Package.json is invalid. Owner/Repo is: '%s'",
  signingEventSignatureNotRecognized = "It is not possible to add a signature to the event.",
  collectMetricsSignatureNotRecognized = "It is not possible to collect metrics from this event.",
}

export enum LogSuccess {
  metricsCollected = "Metrics have been collected for: %s.",
}
