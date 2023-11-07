import { DataEvent, MetricData, MetricsSignature } from "../../interfaces";
import { CheckSuiteCompletedEvent } from "../../github.interfaces";
import { CheckSuiteMetricsOutput } from "./interfaces";
import moment from "moment";

export const collectCheckSuiteMetrics = async (
  dataEvent: DataEvent
): Promise<MetricData> => {
  const payload = dataEvent.payload as CheckSuiteCompletedEvent;

  const pull_requests = payload.check_suite.pull_requests;
  const created_at = moment.utc(payload.check_suite.created_at).valueOf();
  const conclusion = payload.check_suite.conclusion;
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
