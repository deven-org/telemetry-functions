import { DataEventSignature } from "../interfaces";

export function identifyDevenEventSignature(
  devenEvent: string
): DataEventSignature | null {
  switch (devenEvent) {
    case "tooling-usage":
      return DataEventSignature.ToolingUsage;
    default:
      return null;
  }
}
