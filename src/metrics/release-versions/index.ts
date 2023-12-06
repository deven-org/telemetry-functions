import {
  SignedTriggerEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { getVersionByString } from "./get-version-by-string";
import {
  ReleaseVersion,
  ReleaseVersionsOutput,
  ReleaseVersionsPayload,
} from "./interfaces";

export const collectReleaseVersionsMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricsSignature.ReleaseVersions>> => {
  const payload = triggerEvent.payload as ReleaseVersionsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;

  const version: ReleaseVersion = getVersionByString(payload.ref);

  const output: ReleaseVersionsOutput = {
    releaseVersion: version,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metricsSignature: MetricsSignature.ReleaseVersions,
    owner,
    repo,
    status: "success",
    output,
  };
};
