import {
  SignedTriggerEvent,
  MetricSignature,
  MetricData,
} from "../../interfaces";
import { getTimestamp } from "../../shared/get-timestamp";
import { CheckSuiteMetricsOutput, CheckSuitePayload } from "./interfaces";

export const collectCheckSuiteMetrics = async (
  triggerEvent: SignedTriggerEvent
): Promise<MetricData<MetricSignature.CheckSuite>> => {
  const payload = triggerEvent.payload as CheckSuitePayload;

  const pullRequests = payload.check_suite.pull_requests.map((pr) => {
    return { id: pr.id };
  });
  const createdAt = getTimestamp(payload.check_suite.created_at);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- this is never null for completed events
  const conclusion = payload.check_suite.conclusion!;
  const isAppOwner = payload?.installation ? true : false;
  const updatedAt = getTimestamp(payload.check_suite.updated_at);

  const output: CheckSuiteMetricsOutput = {
    pull_requests: pullRequests,
    created_at: createdAt,
    conclusion,
    is_app_owner: isAppOwner,
    updated_at: updatedAt,
  };

  return {
    created_at: triggerEvent.created_at,
    trigger_event_signature: triggerEvent.trigger_event_signature,
    metric_signature: MetricSignature.CheckSuite,
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    status: "success",
    output,
  };
};
