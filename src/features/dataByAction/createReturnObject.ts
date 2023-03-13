import R from "ramda";
import { Content, Data } from "../../interface";

const getMessage = (owner, repo, action) =>
  `auto(data): ${owner}/${repo} - ${action}`;

export const getPath = (pieces: string[]) =>
  R.pipe(R.join("/"), R.toLower)(pieces);

export const createReturnObject = async (data: Content): Promise<Data> => {
  const { event, ...content } = data;
  return {
    path: getPath([data.owner, data.repo, `${Date.now()}.json`]),
    message: getMessage(data.owner, data.repo, data.action),
    content,
  };
};
