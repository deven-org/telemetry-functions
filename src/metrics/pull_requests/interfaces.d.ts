export interface PullRequestClosedPayload {
  action: "closed";
  requested_reviewers: any[];
  pull_request: {
    user: {
      login: string;
    };
    title: string;
    comments: number;
    commits: number;
    changed_files: number;
    created_at: string;
    merged_at: string;
    updated_at: string;
    merged: boolean;
    review_comments: number;
    merged_by: {
      login: string;
    };
  };
}

export type PullRequestClosedOutput = {
  commits: number;
  comments: number;
  merged: boolean;
  files_changed: number;
  requested_reviewers: number;
  review_comments: number;
  release: any;
  user: string;
  duration: number;
  did_creator_merge: boolean;
};
