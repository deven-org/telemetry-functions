import { extractCommonData, appendByCompleted } from "./data-extractors";
import { getPath } from "./shared/utils";
import R from "ramda";

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

const isCompleted = R.propEq("action", "completed");

const appendByAction = (data: CommonData) =>
  R.cond([
    [isCompleted, appendByCompleted],
    [R.T, R.always(data)],
  ])(data);

const createReturnObject = (data: Content): Data => ({
  path: getPath([data.owner, data.repo, `${Date.now()}.json`]),
  message: getMessage(data.owner, data.repo, data.action),
  content: data,
});

export const dataByAction = (eventBody: EventBody): Data =>
  R.pipe(extractCommonData, appendByAction, createReturnObject)(eventBody);
