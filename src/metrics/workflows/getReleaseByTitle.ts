import { pick } from "ramda";
import semverCoerce from "semver/functions/coerce";

export const getReleaseByTitle = (title: string) =>
  pick(
    ["raw", "major", "minor", "patch", "prerelease", "build", "version"],
    semverCoerce(title)
  );
