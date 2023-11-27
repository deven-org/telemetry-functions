export type ToolingUsagePayload = {
  repo: string;
  owner: string;
};

export interface ToolingUsageOutput {
  hasDocumentationSkeleton: boolean;
  hasValidPackageJson: boolean;
  hasDocChapters: boolean;
}
