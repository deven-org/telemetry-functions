import { DevenEvent, TriggerEventSignature } from "../interfaces";

export function identifyDevenEventSignature(
  devenEvent: string
): TriggerEventSignature | null {
  switch (devenEvent) {
    case DevenEvent.ToolingUsage:
      return TriggerEventSignature.DevenToolingUsage;
    default:
      return null;
  }
}
