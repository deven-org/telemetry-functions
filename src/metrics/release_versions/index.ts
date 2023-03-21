import { PullRequestClosedEvent } from "../../github.interfaces";
import { DataEvent, MetricsSignature } from "../../interfaces";
import { getReleaseByTitle } from "./getReleaseByTitle";
import { ReleaseVersionsOutput } from "./interfaces";

export const collectReleaseVersionsMetrics = async (
  dataEvent: DataEvent
): Promise<DataEvent> => {
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
    ...dataEvent,
    metricsSignature: MetricsSignature.ReleaseVersions,
    repo,
    owner,
    output,
  };
};
