import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { getReleaseByTitle } from "./getReleaseByTitle";
import { ReleaseVersionsOutput, ReleaseVersionsPayload } from "./interfaces";

export const collectReleaseVersionsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData<MetricsSignature.ReleaseVersions>> => {
  const payload = dataEvent.payload as ReleaseVersionsPayload;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const pr_id = payload.pull_request.id;
  const title = getReleaseByTitle(payload.pull_request.title);

  const output: ReleaseVersionsOutput = {
    pr_id,
    title,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.ReleaseVersions,
    owner,
    repo,
    output,
  };
};
