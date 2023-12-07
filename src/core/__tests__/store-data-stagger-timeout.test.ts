describe("githubStaggerTimeout", () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    process.env = {};
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it("has timeout set to 0 in tests", () => {
    // not really a unit test but if test env timeout is not 0 other tests
    // that fake timers will break
    expect(OLD_ENV.STORE_DATA_STAGGER_TIMEOUT).toBe("0");
  });

  it("has no timeout when env is set to 0", async () => {
    process.env.STORE_DATA_STAGGER_TIMEOUT = "0";
    jest.resetModules();
    const { storeDataStaggerTimeout: githubStaggerTimeout } = await import(
      "../store-data-stagger-timeout"
    );
    await expect(githubStaggerTimeout()).resolves.not.toThrow();
  });

  it("has set timeout when env is set", async () => {
    process.env.STORE_DATA_STAGGER_TIMEOUT = "15";
    jest.resetModules();
    const { storeDataStaggerTimeout: githubStaggerTimeout } = await import(
      "../store-data-stagger-timeout"
    );

    let resolved = false;
    const wrapped = githubStaggerTimeout().then(() => (resolved = true));

    jest.advanceTimersByTime(14);
    // needed to make then() callback run if promise is resolved by now.
    await Promise.resolve();

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(2);

    await expect(wrapped).resolves.not.toThrow();
    expect(resolved).toBe(true);
  });

  it("has timeout of 10 when env is not set", async () => {
    jest.resetModules();
    const { storeDataStaggerTimeout: githubStaggerTimeout } = await import(
      "../store-data-stagger-timeout"
    );

    let resolved = false;
    const wrapped = githubStaggerTimeout().then(() => (resolved = true));

    jest.advanceTimersByTime(9);
    // needed to make then() callback run if promise is resolved by now.
    await Promise.resolve();

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(2);

    await expect(wrapped).resolves.not.toThrow();
    expect(resolved).toBe(true);
  });
});
