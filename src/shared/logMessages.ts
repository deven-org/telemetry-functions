export enum LogErrors {
  collectMetricsSignatureNotRecognized = "The signature of the data event is not recognized.",
  signingEventSignatureNotRecognized = "Can't identify the signature of the data event. Skipping.",
}

export enum LogInfos {
  eventReceived = "Event has been received.",
  eventSigned = "Event has been signed as: '%s'",
  startCollectingMetrics = "Trying to collect metrics...",
}
