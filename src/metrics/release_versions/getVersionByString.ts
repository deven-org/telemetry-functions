import { SemVer, clean as semverClean, parse as semverParse } from "semver";
import { ReleaseVersion } from "./interfaces";
import { LogErrors } from "../../shared/logMessages";
import pick from "lodash.pick";

export const getVersionByString = (ref: string): ReleaseVersion => {
  const version: SemVer | null = semverParse(semverClean(ref, { loose: true }));
  if (version === null) {
    // this error should already be caught by the metric condition and type check of the metric itself
    throw new Error(
      `${LogErrors.releaseVersionsUnexpectedInvalidVersion}: ${ref}`
    );
  }

  return pick(version, [
    "raw",
    "major",
    "minor",
    "patch",
    "prerelease",
    "build",
    "version",
  ]);
};
