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
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
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
  watchers_count: number;
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
  updated_at: string;
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
  repository: Repository;
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

export type CommitsInPullRequest = CommitInPullRequest[];
interface CommitInPullRequest {
  commit: Commit;
  author: Author;
  committer: User;
  parents: Tree[];
}

interface Commit {
  url: string;
  author: Author;
  committer: Author;
  message: string;
  tree: Tree;
  comment_count: number;
  verification: Verification;
}

interface Verification {
  verified: boolean;
  reason: string;
  signature?: any;
  payload?: any;
}

interface Tree {
  url: string;
  sha: string;
}

interface Author {
  name: string;
  email: string;
  date: string;
}

export interface Deployment {
  task: string;
  payload: any;
  original_environment: string;
  environment: string;
  description: string;
  creator: Creator;
  created_at: string;
  updated_at: string;
  statuses_url: string;
  repository_url: string;
  transient_environment: boolean;
  production_environment: boolean;
  repository: Repository;
}

interface Creator {
  login: string;
  id: number;
  node_id: string;
  type: string;
  site_admin: boolean;
}

export type DeploymentCreatedEvent = {
  action: "created";
  repository: Repository;
  deployment: Deployment;
};

interface WorkflowJobStep {
  name: string;
  status: string;
  conclusion: string;
  number: number;
  started_at: string;
  completed_at: string;
}
export type WorkflowJobCompletedEvent = {
  action: string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  workflow_job: {
    id: number;
    completed_at: string;
    started_at: string;
    created_at: string;
    status: string;
    workflow_name: string;
    run_attempt: number;
    steps: WorkflowJobStep[];
    conclusion: string;
  };
};
