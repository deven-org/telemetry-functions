export type ToolingUsagePayload = {
  /** Repository name */
  owner: string;

  /** Repository owner */
  repo: string;
};

export type ToolingUsageOutput = {
  /**
   * Data based on the target repository's deven-skeleton-install.config.json.
   * null means the data could not be fetched due to reasons other than the file
   * not existing (status: 'networkError').
   */
  documentationSkeletonConfig: null | {
    /** Does the config exist? */
    exists: boolean;

    /**
     * Is the config parsable?
     * null if file doesn't exist
     */
    parsable: null | boolean;

    /**
     * If config was found, parsed, and version is set: the version specified
     * Otherwise null
     */
    version: string | null;
  };
};
