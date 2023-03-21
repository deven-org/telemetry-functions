import moment from "moment";
import { DataEventSignature, DataEvent } from "../interfaces";

export function createDataEvent<T extends DataEventSignature>(
  dataEvent: Omit<DataEvent<T>, "created_at">
): DataEvent<T> {
  return {
    ...dataEvent,
    created_at: moment().unix().valueOf(),
    repo: "",
    owner: "",
  };
}
