import { CheckSuiteCompletedEvent } from "@octokit/webhooks-types";

export type CheckSuitePayload = CheckSuiteCompletedEvent;

export interface CheckSuiteMetricsOutput {
  pull_requests: { id: number }[];
  created_at: number;
  conclusion: string;
  is_app_owner: boolean;
  updated_at: number;
  duration: number;
}
