export type ToolingUsagePayload = {
  /** Repository name */
  owner: string;

  /** Repository owner */
  repo: string;
};

export type ToolingUsageOutput = {
  /**
   * Does the target repository's default branch include a
   * deven-skeleton-install.config.json?
   */
  hasDocumentationSkeleton: boolean;

  /** If config was found: the version specified, otherwise undefined */
  documentationSkeletonVersion: string | undefined;
};
