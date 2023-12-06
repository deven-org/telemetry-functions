import { TriggerEventSignature, SignedTriggerEvent } from "../interfaces";

// This comparison is somewhat trivial, but it helps typescript infer the
// specialized type.
export function validateEventSignature<T extends TriggerEventSignature>(
  triggerEvent: SignedTriggerEvent,
  signature: T
): triggerEvent is SignedTriggerEvent<T> {
  return triggerEvent.trigger_event_signature === signature;
}
