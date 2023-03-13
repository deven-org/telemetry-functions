import { EventBody, CommonData } from "../../interface";

export const createCommonDataObject = (event: EventBody): CommonData => {
  const [owner, repo] = event.repository.full_name.split("/");

  return {
    action: event.action,
    repo,
    owner,
    event,
  };
};
