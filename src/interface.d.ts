export interface Data {
  path: string;
  message: string;
  content: Content;
}

export interface CommonData {
  notParsed?: boolean;
  action: string;
  repo: string;
  owner: string;
  event?: EventBody;
}

export interface PRData {
  commits: number;
  comments: number;
}

export interface ClosedData extends CommonData {
  action: "completed";
  commits: number;
}

export interface EventBody {
  action: string;
  repository: {
    full_name: string;
  };
}

export type Content = CommonData | ClosedData;
