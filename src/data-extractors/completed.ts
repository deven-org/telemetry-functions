import { CommonData, CompletedData, EventBody } from "../dataByEvent";

export const appendByCompleted = (
  data: CommonData,
  event: EventBody
): CompletedData => {
  return {
    ...data,
    action: "completed",
    commits: 0,
  };
};
