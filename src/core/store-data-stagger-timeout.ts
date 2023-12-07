const DEFAULT_TIMEOUT = 10;

const STORE_DATA_STAGGER_TIMEOUT = process.env.STORE_DATA_STAGGER_TIMEOUT
  ? parseInt(process.env.STORE_DATA_STAGGER_TIMEOUT, 10)
  : DEFAULT_TIMEOUT;

/**
 * This timeout is used between requests to the database.
 * This was introduced due to github erroring with 409 conflicts when saving too
 * many files at once.
 *
 * An alternative approach would be to save data as a tree instead, but we
 * decided to use a timeout until necessary (since the used storage might
 * change soon)
 */
export const storeDataStaggerTimeout = () =>
  new Promise((resolve) => {
    if (STORE_DATA_STAGGER_TIMEOUT > 0) {
      setTimeout(resolve, STORE_DATA_STAGGER_TIMEOUT);
    } else {
      resolve(undefined);
    }
  });
