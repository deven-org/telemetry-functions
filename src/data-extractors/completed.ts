import { CommonData, CompletedData, EventBody } from "../dataByEvent";

export const appendByCompleted = (data): CompletedData => {
  return {
    ...data,
    action: "completed",
    commits: 0,
  };
};
