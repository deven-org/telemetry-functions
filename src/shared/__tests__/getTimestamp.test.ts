import { GetTimestampError, getTimestamp } from "../getTimestamp";

describe("getTimestamp", () => {
  it("converts a date, as provided by GitHub API to UNIX ms timestamp", () => {
    expect(getTimestamp("1970-01-01T00:00:03Z")).toEqual(3000);
    expect(getTimestamp("2019-05-15T15:19:25Z")).toEqual(1557933565000);
  });

  it("throws an error on non-string data", () => {
    expect(() => {
      // @ts-expect-error -- purposefully using wrong type for testing runtime checks
      getTimestamp(undefined);
    }).toThrowError(GetTimestampError);

    expect(() => {
      // @ts-expect-error -- purposefully using wrong type for testing runtime checks
      getTimestamp({ date: 1557933565000 });
    }).toThrowError(GetTimestampError);
  });

  it("throws an error on invalid date string", () => {
    expect(() => {
      getTimestamp("2019-05-32T15:19:25Z");
    }).toThrowError(GetTimestampError);

    expect(() => {
      getTimestamp("oops");
    }).toThrowError(GetTimestampError);
  });
});
