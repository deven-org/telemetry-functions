export interface Owner {
  login: string;
  id: number;
  node_id: string;
  url: string;
  type: string;
  site_admin: boolean;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  url: string;
  type: string;
  site_admin: boolean;
}

export interface License {
  key: string;
  name: string;
  url: string;
  spdx_id: string;
  node_id: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  template_repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    owner: Owner;
  };
  private: boolean;
  description: string;
  url: string;
  language: string;
  forks: number;
  forks_count: number;
  stargazers_count: number;
  watchers: number;
  watchers_counnt: number;
  size: number;
  default_branch: string;
  open_issues: number;
  open_issues_count: number;
  is_template: number;
  license: License;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  allow_rebase_merge: boolean;
  temp_clone_token: string;
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_merge_commit: boolean;
  subscribers_count: number;
  network_count: number;
}

export interface PullRequest {
  created_at: string;
  closed_at: string;
  merged_at: string;
  comments: number;
  review_comments: number;
  changed_files: number;
  requested_reviewers: string[];
  requested_teams: string[];
  merged_by: User;
  number: number;
  state: "open" | "closed";
  locked: boolean;
  title: string;
  user: User;
  labels: [];
  milestone: any;
  assignee: User;
  assignees: User[];
  auto_merge: any;
  draft: boolean;
  merged: boolean;
  mergeable: boolean;
  rebaseable: boolean;
  additions: number;
  deletions: number;
  merge_commit_message: string;
  merge_commit_title: string;
  repository: Repository;
  sender: User;
}

export interface PullRequestEvent {
  action: string;
  number: number;
  organization: any;
  pull_request: PullRequest;
}

export interface PullRequestClosedEvent extends PullRequestEvent {
  action: "closed";
}

export interface CheckSuite {
  id: number;
  node_id: string;
  head_branch: string;
  head_sha: string;
  status: "queued" | "in_progress" | "completed";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "timed_out"
    | "action_required"
    | "stale";
  url: string;
  before: string;
  after: string;
  pull_requests: PullRequest[];
  created_at: string;
  updated_at: string;
  app: {
    id: number;
    slug: string;
    node_id: string;
    owner: Owner;
    name: string;
    description: string;
    external_url: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    permissions: {
      metadata: "read" | "write";
      contents: "read" | "write";
      issues: "read" | "write";
      single_file: "read" | "write";
    };
    events: string[];
  };
  repository: Repository;
  head_commit: any;
  latest_check_runs_count: number;
  check_runs_url: string;
}

export interface CheckSuiteEvent {
  action: string;
  check_suite: any;
  organization: any;
  repository: Repository;
  installation?: any;
  owner: string;
  sender: User;
}

export interface CheckSuiteCompletedEvent extends CheckSuiteEvent {
  action: "completed";
  check_suite: CheckSuite;
  organization: any;
  repository: Repository;
  sender: User;
}
