import { DataEventSignature, SignedDataEvent } from "../interfaces";

// This comparison is somewhat trivial, but it helps typescript infer the
// specialized type.
export function validateEventSignature<T extends DataEventSignature>(
  dataEvent: SignedDataEvent,
  signature: T
): dataEvent is SignedDataEvent<T> {
  return dataEvent.dataEventSignature === signature;
}
