import { DataEventSignature, TriggerSource } from "../interfaces";
import { identifyDevenEventSignature } from "./deven-event-signature";
import { identifyGithubEventSignature } from "./github-event-signature";

export function identifyTriggerEventSignature(
  source: TriggerSource,
  sourceEventSignature: string
): DataEventSignature | null {
  switch (source) {
    case TriggerSource.Github:
      return identifyGithubEventSignature(sourceEventSignature);
    case TriggerSource.Deven:
      return identifyDevenEventSignature(sourceEventSignature);
    default:
      return null;
  }
}
