import { allPass, propEq } from "ramda";
import { DataEventSignature } from "../../interfaces";

export const isToolingUsed = allPass([
  propEq("eventSignature", "toolingUsage"),
]);

export default [[isToolingUsed, DataEventSignature.ToolingUsage]];
