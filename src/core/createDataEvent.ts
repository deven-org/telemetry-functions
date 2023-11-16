import moment from "moment";
import { DataEventSignature, SignedDataEvent } from "../interfaces";

export function createDataEvent<T extends DataEventSignature>(
  dataEvent: Omit<SignedDataEvent<T>, "created_at">
): SignedDataEvent<T> {
  return {
    ...dataEvent,
    created_at: moment().valueOf(),
  };
}
