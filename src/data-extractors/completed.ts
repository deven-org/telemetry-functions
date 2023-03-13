import { CommonData, CompletedData, EventBody } from "../dataByEvent";
import { getPullRequest } from "../graphql";

export const appendByCompleted = async (data): Promise<CompletedData> => {
  try {
    const a = await getPullRequest("deven-org", "documentation-skeleton", 10);
  } catch (e) {
    console.log(e);
  }
  return {
    ...data,
    action: "completed",
    commits: 0,
  };
};
