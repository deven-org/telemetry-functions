import { propEq, allPass } from "ramda";

export const isPackages = propEq("signature", "packages");
export const isMergedPr = (arg) =>
  allPass([
    propEq("eventSignature", "pull_request"),
    propEq("action", "closed"),
  ]);
export const isWorkflowJobCompleted = (arg) =>
  allPass([
    propEq("eventSignature", "workflow"),
    propEq("action", "completed"),
  ]);
