import { extractCommonData, appendByCompleted } from "./data-extractors";

export interface CommonData {
  action: string;
  repo: string;
  owner: string;
}

export interface CompletedData extends CommonData {
  action: "completed";
  commits: number;
}

export interface EventBody {
  action: string;
  repository: {
    full_name: string;
  };
}

type Data = CommonData | CompletedData;

export const dataByAction = (eventBody: EventBody): Data => {
  let data: Data = extractCommonData(eventBody);

  switch (eventBody.action) {
    case "completed":
      data = appendByCompleted(data, eventBody);
      break;
  }

  return data;
};
