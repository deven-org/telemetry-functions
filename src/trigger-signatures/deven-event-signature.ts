import { TriggerEventSignature } from "../interfaces";

export function identifyDevenEventSignature(
  devenEvent: string
): TriggerEventSignature | null {
  switch (devenEvent) {
    case "tooling-usage":
      return TriggerEventSignature.ToolingUsage;
    default:
      return null;
  }
}
