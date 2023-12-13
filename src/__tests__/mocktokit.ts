type OctokitMockEndpoints = Record<
  string,
  (...args: unknown[]) => Promise<unknown>
>;

class MocktokitImpl {
  mocks: OctokitMockEndpoints = {};
  storeDataMocks: OctokitMockEndpoints = {};

  unexpectedRequest = jest.fn(async (endpoint) => {
    throw new Error(`unexpected octokit request to "${endpoint}"`);
  });

  get unexpectedRequestsMade() {
    return this.unexpectedRequest.mock.calls;
  }

  reset(
    storeDataEndpoints: OctokitMockEndpoints = {},
    defaultEndpoints: OctokitMockEndpoints = {}
  ) {
    this.unexpectedRequest.mockReset();
    this.mocks = defaultEndpoints;
    this.storeDataMocks = storeDataEndpoints;
  }
}

export const Mocktokit = new MocktokitImpl();

export const STORE_DATA_MOCKS: OctokitMockEndpoints = {
  "GET /repos/{owner}/{repo}/commits": async () => ({
    data: [
      {
        sha: "1abc",
        commit: { tree: { sha: "1def" } },
      },
    ],
  }),
  "POST /repos/{owner}/{repo}/git/trees": async () => ({
    data: { sha: "2def" },
  }),
  "POST /repos/{owner}/{repo}/git/commits": async () => ({
    data: { sha: "2abc" },
  }),
  "PATCH /repos/{owner}/{repo}/git/refs/{ref}": async () => undefined,
};

/**
 * mock implementation for core/octokit.ts to use with jest.mock()
 *
 * Note that for simplicity, both importable octokit instances (general read
 * access & data repo write access) point to the same mocktokit instance.
 */
export const octokitModuleMock: Record<string, unknown> = {
  __esModule: true,
  default: {
    request: async (endpoint: string, ...rest) => {
      const mockedRequest =
        Mocktokit.mocks[endpoint] ?? Mocktokit.unexpectedRequest;
      return mockedRequest(endpoint, ...rest);
    },
  },
  octokitForDataRepo: {
    request: async (endpoint: string, ...rest) => {
      const mockedRequest =
        Mocktokit.storeDataMocks[endpoint] ?? Mocktokit.unexpectedRequest;
      return mockedRequest(endpoint, ...rest);
    },
  },
};
