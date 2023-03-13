import * as fixtureMergedPullRequest from "./fixtures/pull-requests/merged-completed-successful.json";
import { dataByAction } from "../src/features/dataByAction";

const mockDate = 1676473416417;
const spy = jest.spyOn(global.Date, "now").mockImplementation(() => mockDate);

describe("dataByEvent", () => {
  describe("PR", () => {
    beforeEach(() => {});

    afterEach(() => {});

    it("returns a filename and a commit message for an event", async () => {
      const data = await dataByAction(fixtureMergedPullRequest);

      expect(data).toMatchObject({
        path: `deven-org/telemetry-functions/1676473416417.json`,
        message: `auto(data): deven-org/telemetry-functions - closed [parsed]`,
        content: {
          action: "closed",
          owner: "deven-org",
          repo: "telemetry-functions",
        },
      });
    });

    it("returns true if it has been merged", async () => {
      const data = await dataByAction(fixtureMergedPullRequest);

      expect(data).toMatchObject({
        content: {
          merged: true,
        },
      });
    });

    it("returns number of commits", async () => {
      const data = await dataByAction(fixtureMergedPullRequest);

      expect(data).toMatchObject({
        path: `deven-org/telemetry-functions/1676473416417.json`,
        message: `auto(data): deven-org/telemetry-functions - closed [parsed]`,
        content: {
          commits: 1,
        },
      });
    });

    it("returns number of review comments", async () => {
      const data = await dataByAction(fixtureMergedPullRequest);
      expect(data).toMatchObject({
        path: `deven-org/telemetry-functions/1676473416417.json`,
        message: `auto(data): deven-org/telemetry-functions - closed [parsed]`,
        content: {
          review_comments: 0,
        },
      });
    });

    it("returns number of changed files", async () => {
      const data = await dataByAction(fixtureMergedPullRequest);
      expect(data).toMatchObject({
        path: `deven-org/telemetry-functions/1676473416417.json`,
        message: `auto(data): deven-org/telemetry-functions - closed [parsed]`,
        content: {
          changed_files: 3,
        },
      });
    });

    describe("merged", () => {
      it("shows the duration of the PR", async () => {
        const data = await dataByAction(fixtureMergedPullRequest);

        expect(data).toMatchObject({
          path: `deven-org/telemetry-functions/1676473416417.json`,
          message: `auto(data): deven-org/telemetry-functions - closed [parsed]`,
          content: {
            duration: 1128042000,
          },
        });
      });
    });
  });
});
