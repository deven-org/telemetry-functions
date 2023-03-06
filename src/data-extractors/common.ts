import { EventBody, CommonData } from "../dataByEvent";

export const extractCommonData = (event: EventBody): CommonData => {
  const [owner, repo] = event.repository.full_name.split("/");
  return {
    action: "completed",
    repo,
    owner,
  };
};
