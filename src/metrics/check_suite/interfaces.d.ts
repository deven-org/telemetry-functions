import { PullRequest } from "../../github.interfaces.ts";

export interface CheckSuiteMetricsOutput {
  pull_requests: PullRequest[];
  created_at: number;
  conclusion: string;
  is_app_owner: boolean;
  updated_at: number;
  duration: number;
}
