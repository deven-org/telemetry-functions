import { pick } from "ramda";
import semverCoerce from "semver/functions/coerce";

export const getReleaseByTitle = (title: string) => {
  const coercedTitle = semverCoerce(title);
  return coercedTitle
    ? pick(
        ["raw", "major", "minor", "patch", "prerelease", "build", "version"],
        semverCoerce(title)
      )
    : null;
};
