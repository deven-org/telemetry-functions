import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { getVersionByString } from "./getVersionByString";
import {
  ReleaseVersion,
  ReleaseVersionsOutput,
  ReleaseVersionsPayload,
} from "./interfaces";

export const collectReleaseVersionsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.ReleaseVersions>> => {
  const payload = dataEvent.payload as ReleaseVersionsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;

  const version: ReleaseVersion = getVersionByString(payload.ref);

  const output: ReleaseVersionsOutput = {
    releaseVersion: version,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.ReleaseVersions,
    owner,
    repo,
    status: "success",
    output,
  };
};
