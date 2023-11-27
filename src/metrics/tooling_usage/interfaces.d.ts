export type ToolingUsagePayload = {
  repo: string;
  owner: string;
};

export interface ToolingUsageOutput {
  hasDocumentationSkeleton: boolean;
  repo: string;
  owner: string;
  hasValidPackageJson: boolean;
  hasDocChapters: boolean;
}
