import { PRData } from "../../../interface";
import semverCoerce from "semver/functions/coerce";
import R from "ramda";

const getReleaseByTitle = (title: string) =>
  R.pick(
    ["raw", "major", "minor", "patch", "prerelease", "build", "version"],
    semverCoerce(title)
  );
export const extractByPr = (data): PRData | undefined => {
  const { pull_request } = data.event;

  try {
    return {
      ...data,
      commits: pull_request.commits,
      comments: pull_request.comments,
      merged: pull_request.merged,
      changed_files: pull_request.changed_files,
      review_comments: pull_request.review_comments,
      release: getReleaseByTitle(pull_request.title),
    };
  } catch (e) {
    console.log(e);
  }
};
