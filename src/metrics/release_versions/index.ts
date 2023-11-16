import { PullRequestClosedEvent } from "../../github.interfaces";
import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { getReleaseByTitle } from "./getReleaseByTitle";
import { ReleaseVersionsOutput } from "./interfaces";

export const collectReleaseVersionsMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as PullRequestClosedEvent;

  const repo = payload.repository.name;
  const owner = payload.repository.owner.login;
  const pull_number = payload.pull_request.number;
  const title = getReleaseByTitle(payload.pull_request.title);

  const output: ReleaseVersionsOutput = {
    pull_number,
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
