import { extractCommonData, appendByCompleted } from "./data-extractors";
import { getPath } from "./shared/utils";

export interface Data {
  path: string;
  message: string;
  content: Content;
}

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

const getMessage = (owner, repo, action) =>
  `auto(data): ${owner}/${repo} - ${action}`;

export type Content = CommonData | CompletedData;

export const dataByAction = (eventBody: EventBody): Data => {
  let data: Content = extractCommonData(eventBody);

  switch (eventBody.action) {
    case "completed":
      data = appendByCompleted(data, eventBody);
      break;
  }

  return {
    path: getPath([data.owner, data.repo, `${Date.now()}.json`]),
    message: getMessage(data.owner, data.repo, eventBody.action),
    content: data,
  };
};
