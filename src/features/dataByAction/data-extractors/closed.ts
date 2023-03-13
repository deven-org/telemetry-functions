import { ClosedData } from "../../../interface";
import { getDuration } from "../getDuration";
import { extractByPr } from "./pr";

export const extractByClosed = async (
  data
): Promise<ClosedData | undefined> => {
  const { pull_request } = data.event;

  return {
    ...data,
    ...extractByPr(data),
    duration: getDuration(pull_request.created_at, pull_request.merged_at),
  };
};
