export enum LogErrors {
  collectMetricsSignatureNotRecognized = "The signature of the data event is not recognized.",
}

export enum LogInfos {
  eventReceived = "Event has been received.",
  eventSigned = "Event has been signed as: '%s'",
  startCollectingMetrics = "Trying to collect metrics...",
}

export enum LogWarnings {
  invalidPackageJson = "Package.json is invalid. Owner/Repo is: '%s'",
  signingEventSignatureNotRecognized = "Can't identify the signature of the data event. Skipping.",
}
