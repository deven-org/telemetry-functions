export type ToolingUsagePayload = {
  repo: string;
  owner: string;
};

export interface ToolingUsageOutput {
  hasDocumentationSkeleton: boolean;
  devDependencies: object;
  dependencies: object;
  repo: string;
  owner: string;
  hasValidPackageJson: boolean;
}
