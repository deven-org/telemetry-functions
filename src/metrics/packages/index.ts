import { DataEvent } from "../../core";

export const collectPackagesMetrics = (
  dataEvent: DataEvent
): Promise<DataEvent> => {
  return new Promise((res) => {
    res({ ...dataEvent, output: dataEvent.payload });
  });
};
