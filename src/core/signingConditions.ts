import { propEq } from "ramda";

export const isPackages = propEq("signature", "packages");
export const isMergedPr = propEq("action", "closed");
