import {
  TriggerEventSignature,
  MetricData,
  MetricSignature,
} from "../../interfaces";
import { WorkflowsOutput } from "../../metrics/workflows/interfaces";
import { Mocktokit } from "../../__tests__/mocktokit";
import { storeData } from "../store-data";
import { LogErrors } from "../../shared/log-messages";
import cloneDeep from "lodash.clonedeep";
import { EnvVarAccessError } from "../../shared/get-env-var";

jest.mock(
  "../octokit.ts",
  () => jest.requireActual("../../__tests__/mocktokit").octokitModuleMock
);

jest.mock("../logger", () => ({
  __esModule: true,
  logger: {
    start: jest.fn(),
    config: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn((e) => {
      // let tests fail if unexpected error gets reported
      throw e;
    }),
    complete: jest.fn(),
    success: jest.fn(),
    pending: jest.fn(),
    skip: jest.fn(),
  },
}));

const output: WorkflowsOutput = {
  id: 1234569,
  created_at: 4000,
  started_at: 4000,
  completed_at: 5000,
  duration: 1000,
  conclusion: "success",
  workflow_name: "workflow-name",
  run_attempt: 1,
  steps: [],
};

const metricData: MetricData[] = [
  {
    trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
    metric_signature: MetricSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
    status: "success",
  },
  {
    trigger_event_signature: TriggerEventSignature.GithubWorkflowJob,
    metric_signature: MetricSignature.WorkflowJob,
    created_at: 100,
    output,
    owner: "owner",
    repo: "repo",
    status: "success",
  },
];

const mockResponses = {
  getCommitsSuccess: {
    status: 200,
    data: [
      {
        sha: "1abc",
        commit: { tree: { sha: "1def" } },
      },
    ],
  },
  getCommitsError: Object.assign(new Error("nothing to see here"), {
    status: 404,
  }),
  postTreeSuccess: {
    status: 201,
    data: {
      sha: "2def",
    },
  },
  postTreeError: Object.assign(new Error("computer says no"), {
    status: 403,
  }),
  postCommitSuccess: {
    status: 201,
    data: { sha: "2abc" },
  },
  postCommitError: Object.assign(new Error("denied"), {
    status: 422,
  }),
  patchRefSuccess: { status: 200 },
  patchRefError: Object.assign(new Error("protected branch"), {
    status: 422,
  }),
};

describe("storeData", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = cloneDeep(OLD_ENV);
    Mocktokit.reset();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  afterEach(() => {
    expect(Mocktokit.unexpectedRequestsMade).toStrictEqual([]);
  });

  it("pushes the metric data to the data repo as json files", async () => {
    const getCommits = jest.fn(async () => mockResponses.getCommitsSuccess);
    const postTree = jest.fn(async () => mockResponses.postTreeSuccess);
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);
    const patchRef = jest.fn(async () => mockResponses.patchRefSuccess);

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": getCommits,
      "POST /repos/{owner}/{repo}/git/trees": postTree,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": patchRef,
    });

    await storeData(metricData);

    expect(getCommits).toHaveBeenCalledTimes(1);
    expect(getCommits.mock.calls[0]).toMatchInlineSnapshot(`
[
  "GET /repos/{owner}/{repo}/commits",
  {
    "owner": "data-repo-owner",
    "per_page": 1,
    "repo": "data-repo-name",
    "sha": "main",
  },
]
`);

    expect(postTree).toHaveBeenCalledTimes(1);
    expect(postTree.mock.calls[0]).toMatchInlineSnapshot(`
[
  "POST /repos/{owner}/{repo}/git/trees",
  {
    "base_tree": "1def",
    "owner": "data-repo-owner",
    "repo": "data-repo-name",
    "tree": [
      {
        "content": "{"trigger_event_signature":"github::workflow_job","metric_signature":"workflow-job","created_at":100,"output":{"id":1234569,"created_at":4000,"started_at":4000,"completed_at":5000,"duration":1000,"conclusion":"success","workflow_name":"workflow-name","run_attempt":1,"steps":[]},"owner":"owner","repo":"repo","status":"success"}
",
        "mode": "100644",
        "path": "raw-data/owner/repo/workflow-job/100.json",
      },
      {
        "content": "{"trigger_event_signature":"github::workflow_job","metric_signature":"workflow-job","created_at":100,"output":{"id":1234569,"created_at":4000,"started_at":4000,"completed_at":5000,"duration":1000,"conclusion":"success","workflow_name":"workflow-name","run_attempt":1,"steps":[]},"owner":"owner","repo":"repo","status":"success"}
",
        "mode": "100644",
        "path": "raw-data/owner/repo/workflow-job/100.json",
      },
    ],
  },
]
`);

    expect(postCommit).toHaveBeenCalledTimes(1);
    expect(postCommit.mock.calls[0]).toMatchInlineSnapshot(`
[
  "POST /repos/{owner}/{repo}/git/commits",
  {
    "author": {
      "email": "author_email",
      "name": "author_name",
    },
    "committer": {
      "email": "committer_email",
      "name": "committer_name",
    },
    "message": "auto(data): add metrics from github::workflow_job for owner/repo",
    "owner": "data-repo-owner",
    "parents": [
      "1abc",
    ],
    "repo": "data-repo-name",
    "tree": "2def",
  },
]
`);

    expect(patchRef).toHaveBeenCalledTimes(1);
    expect(patchRef.mock.calls[0]).toMatchInlineSnapshot(`
[
  "PATCH /repos/{owner}/{repo}/git/refs/{ref}",
  {
    "force": false,
    "owner": "data-repo-owner",
    "ref": "heads/main",
    "repo": "data-repo-name",
    "sha": "2abc",
  },
]
`);
  });

  it("throws error if data array is empty", async () => {
    await expect(() => storeData([])).rejects.toBeInstanceOf(Error);
  });

  it("warns about no read access, if get request errors", async () => {
    Mocktokit.storeDataMocks["GET /repos/{owner}/{repo}/commits"] =
      async () => {
        throw mockResponses.getCommitsError;
      };

    await expect(() => storeData(metricData)).rejects.toMatchObject({
      level: "error",
      message: LogErrors.dataRepoNoReadAccess,
      params: ["404"],
    });
  });

  it("throws received error, if get commit request with a different error than expected", async () => {
    Mocktokit.storeDataMocks["GET /repos/{owner}/{repo}/commits"] =
      async () => {
        throw "no";
      };

    await expect(() => storeData(metricData)).rejects.toBe("no");

    const nonHttpError = new Error("cannot resolve module left-pad");
    Mocktokit.storeDataMocks["GET /repos/{owner}/{repo}/commits"] =
      async () => {
        throw nonHttpError;
      };

    const fakeError = { message: "fake it 'til you make it", status: 400 };
    Mocktokit.storeDataMocks["GET /repos/{owner}/{repo}/commits"] =
      async () => {
        throw fakeError;
      };

    await expect(() => storeData(metricData)).rejects.toBe(fakeError);
  });

  it("warns about no write access, if post request errors", async () => {
    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () => {
        throw mockResponses.postTreeError;
      },
    });

    await expect(() => storeData(metricData)).rejects.toMatchObject({
      level: "error",
      message: LogErrors.dataRepoNoWriteAccess,
      params: ["403"],
    });
  });

  it("throws received error, if get commit request with a different error than expected", async () => {
    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () => {
        throw "no";
      },
    });

    await expect(() => storeData(metricData)).rejects.toBe("no");

    const nonHttpError = new Error("cannot resolve module left-pad");
    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () => {
        throw nonHttpError;
      },
    });

    const fakeError = { message: "fake it 'til you make it", status: 403 };
    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () => {
        throw fakeError;
      },
    });

    await expect(() => storeData(metricData)).rejects.toBe(fakeError);
  });

  it("throws received error, if commit post errors", async () => {
    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () =>
        mockResponses.postTreeSuccess,
      "POST /repos/{owner}/{repo}/git/commits": async () => {
        throw mockResponses.postCommitError;
      },
    });

    await expect(() => storeData(metricData)).rejects.toBe(
      mockResponses.postCommitError
    );
  });

  it("throws received error, if ref change fails without HEAD change", async () => {
    process.env.CONFLICT_RETRIES = "2";

    const getCommits = jest.fn(async () => mockResponses.getCommitsSuccess);
    const postTree = jest.fn(async () => mockResponses.postTreeSuccess);
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);
    const patchRef = jest.fn(async () => {
      throw mockResponses.patchRefError;
    });

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": getCommits,
      "POST /repos/{owner}/{repo}/git/trees": postTree,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": patchRef,
    });

    await expect(() => storeData(metricData)).rejects.toBe(
      mockResponses.patchRefError
    );

    expect(getCommits).toHaveBeenCalledTimes(2);
    expect(postTree).toHaveBeenCalledTimes(1);
    expect(postCommit).toHaveBeenCalledTimes(1);
    expect(patchRef).toHaveBeenCalledTimes(1);
  });

  it("retries CONFLICT_RETRIES times if HEAD SHA changed in between and then throws error", async () => {
    process.env.CONFLICT_RETRIES = "5";
    let count = 0;

    const getCommits = jest.fn(async () => {
      const response = cloneDeep(mockResponses.getCommitsSuccess);
      (response.data[0].sha += count.toString()),
        (response.data[0].commit.tree.sha += count.toString()),
        (count += 1);
      return response;
    });
    const postTree = jest.fn(async () => mockResponses.postTreeSuccess);
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);
    const patchRef = jest.fn(async () => {
      throw mockResponses.patchRefError;
    });

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": getCommits,
      "POST /repos/{owner}/{repo}/git/trees": postTree,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": patchRef,
    });

    await expect(() => storeData(metricData)).rejects.toBe(
      mockResponses.patchRefError
    );

    expect(getCommits).toHaveBeenCalledTimes(6);
    expect(postTree).toHaveBeenCalledTimes(6);
    expect(postCommit).toHaveBeenCalledTimes(6);
    expect(patchRef).toHaveBeenCalledTimes(6);
  });

  it("does not retry if CONFLICT_RETRIES is unset", async () => {
    process.env.CONFLICT_RETRIES = undefined;

    let count = 0;

    const getCommits = jest.fn(async () => {
      const response = cloneDeep(mockResponses.getCommitsSuccess);
      (response.data[0].sha += count.toString()),
        (response.data[0].commit.tree.sha += count.toString()),
        (count += 1);
      return response;
    });
    const postTree = jest.fn(async () => mockResponses.postTreeSuccess);
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);
    const patchRef = jest.fn(async () => {
      throw mockResponses.patchRefError;
    });

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": getCommits,
      "POST /repos/{owner}/{repo}/git/trees": postTree,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": patchRef,
    });

    await expect(() => storeData(metricData)).rejects.toBe(
      mockResponses.patchRefError
    );

    expect(getCommits).toHaveBeenCalledTimes(1);
    expect(postTree).toHaveBeenCalledTimes(1);
    expect(postCommit).toHaveBeenCalledTimes(1);
    expect(patchRef).toHaveBeenCalledTimes(1);
  });

  it("does not add author, if respective env vars are unset", async () => {
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () =>
        mockResponses.postTreeSuccess,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": async () =>
        mockResponses.patchRefSuccess,
    });

    process.env.AUTHOR_NAME = undefined;
    await storeData(metricData);

    process.env.AUTHOR_NAME = "Amber";
    process.env.AUTHOR_EMAIL = "";
    await storeData(metricData);

    expect(postCommit).toHaveBeenCalledTimes(2);

    expect(postCommit.mock.calls).toMatchObject([
      ["POST /repos/{owner}/{repo}/git/commits", { author: undefined }],
      ["POST /repos/{owner}/{repo}/git/commits", { author: undefined }],
    ]);
  });

  it("does not add committer, if respective env vars are unset", async () => {
    const postCommit = jest.fn(async () => mockResponses.postCommitSuccess);

    Object.assign(Mocktokit.storeDataMocks, {
      "GET /repos/{owner}/{repo}/commits": async () =>
        mockResponses.getCommitsSuccess,
      "POST /repos/{owner}/{repo}/git/trees": async () =>
        mockResponses.postTreeSuccess,
      "POST /repos/{owner}/{repo}/git/commits": postCommit,
      "PATCH /repos/{owner}/{repo}/git/refs/{ref}": async () =>
        mockResponses.patchRefSuccess,
    });

    process.env.COMMITTER_NAME = "";
    await storeData(metricData);

    process.env.COMMITTER_NAME = "Bobby";
    process.env.COMMITTER_EMAIL = undefined;
    await storeData(metricData);

    expect(postCommit).toHaveBeenCalledTimes(2);

    expect(postCommit.mock.calls).toMatchObject([
      ["POST /repos/{owner}/{repo}/git/commits", { committer: undefined }],
      ["POST /repos/{owner}/{repo}/git/commits", { committer: undefined }],
    ]);
  });

  it("throws if required env var is unset", async () => {
    process.env.REPO_NAME = "";

    await expect(() => storeData(metricData)).rejects.toBeInstanceOf(
      EnvVarAccessError
    );
  });
});
