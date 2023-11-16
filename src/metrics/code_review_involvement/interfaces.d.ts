export type CodeReviewInvolvementOutput = {
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
  packages: any;
};
