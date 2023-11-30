import { clean as semverClean } from "semver";
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
import { LogErrors } from "../../shared/logMessages";

export const collectReleaseVersionsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.ReleaseVersions>> => {
  const payload = dataEvent.payload as ReleaseVersionsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;

  let version: ReleaseVersion = getVersionByString(payload.ref);

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
