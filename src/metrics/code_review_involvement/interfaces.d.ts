export type PullRquestClosedPayload = {
  action: "closed";
  number: number;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  pull_request: {
    user: {
      login: string;
    };
    created_at: string;
    updated_at: string;
    closed_at: string;
    merged_at: string;
    comments: number;
    review_comments: number;
    changed_files: number;
    requested_reviewers: string[];
    requested_teams: string[];
    merged_by: {
      login: string;
    };
  };
};
export type PullRquestClosedOutput = {
  repo: string;
  owner: string;
  number: number;
  created_at: number;
  updated_at: number;
  closed_at: number;
  merged_at: number;
  total_duration: number;
  created_to_merged_duration: number;
  updated_to_closed: number;
  comments: number;
  review_comments: number;
  changed_files: number;
  has_been_merged_by_author: boolean;
  requested_reviewers: number;
  requested_teams: number;
};
