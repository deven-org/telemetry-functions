import {
  SignedDataEvent,
  MetricsSignature,
  MetricData,
} from "../../interfaces";
import { CheckSuiteMetricsOutput, CheckSuitePayload } from "./interfaces";
import moment from "moment";

export const collectCheckSuiteMetrics = async (
  dataEvent: SignedDataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as CheckSuitePayload;

  const pull_requests = payload.check_suite.pull_requests;
  const created_at = moment.utc(payload.check_suite.created_at).valueOf();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- this is never null for completed events
  const conclusion = payload.check_suite.conclusion!;
  const is_app_owner = payload?.installation ? true : false;
  const updated_at = moment.utc(payload.check_suite.updated_at).valueOf();
  const duration = updated_at - created_at;

  const output: CheckSuiteMetricsOutput = {
    pull_requests,
    created_at,
    conclusion,
    is_app_owner,
    updated_at,
    duration,
  };

  return {
    created_at: dataEvent.created_at,
    dataEventSignature: dataEvent.dataEventSignature,
    metricsSignature: MetricsSignature.CheckSuite,
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    output,
  };
};
