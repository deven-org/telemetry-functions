type OctokitMockEndpoints = Record<
  string,
  (...args: unknown[]) => Promise<unknown>
>;

class MocktokitImpl {
  mocks: OctokitMockEndpoints = {};

  unexpectedRequest = jest.fn(async (endpoint) => {
    throw new Error(`unexpected octokit request to "${endpoint}"`);
  });

  get unexpectedRequestsMade() {
    return this.unexpectedRequest.mock.calls;
  }

  reset(defaultEndpoints: OctokitMockEndpoints = {}) {
    this.unexpectedRequest.mockReset();
    this.mocks = defaultEndpoints;
  }
}

export const Mocktokit = new MocktokitImpl();

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
};

octokitModuleMock.octokitForDataRepo = octokitModuleMock.default;
