type OctokitMockEndpoints = Record<
  string,
  (...args: unknown[]) => Promise<unknown>
>;

class MocktokitImpl {
  get defaultEndpoints(): OctokitMockEndpoints {
    return {
      ["PUT /repos/{owner}/{repo}/contents/{path}"]: jest.fn(
        async () => undefined
      ),
    };
  }

  mocks: OctokitMockEndpoints = {};

  unexpectedRequest = jest.fn(async (endpoint) => {
    throw new Error(`unexpected octokit request to "${endpoint}"`);
  });

  reset() {
    this.unexpectedRequest.mockReset();
    this.mocks = {};
  }

  resetToDefault() {
    this.unexpectedRequest.mockReset();
    this.mocks = Mocktokit.defaultEndpoints;
  }
}

export const Mocktokit = new MocktokitImpl();

/** mock implementation for core/octokit.ts to use with jest.mock() */
export const octokitModuleMock = {
  __esModule: true,
  default: {
    request: async (endpoint: string, ...rest) => {
      const mockedRequest =
        Mocktokit.mocks[endpoint] ?? Mocktokit.unexpectedRequest;
      return mockedRequest(endpoint, ...rest);
    },
  },
};
