export type PullRequestPayload = {
  action: "closed";
  number: number;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  pull_request: {
    commits: number;
    additions: number;
    deletions: number;
  };
};

export interface PullRequestOutput {
  // hasDocumentationSkeleton: boolean;
  // devDependencies: object;
  // dependencies: object;
  // repo: string;
  // owner: string;
  // hasValidPackageJson: boolean;
  // hasDocChapters: boolean;
}
