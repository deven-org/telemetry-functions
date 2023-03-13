import { dataByAction } from "../src/dataByEvent";
import fetchMock from "fetch-mock";
import dotenv from "dotenv";

const basicEventObj = {
  body: JSON.stringify("test"),
};

dotenv.config({ path: ".env" });
console.log(process.env.GITHUB_ACCESS_TOKEN);

process.env.REPO_NAME = "telemetry-data";
process.env.REPO_OWNER = "deven-org";
process.env.REPO_PATH = "raw-data";
process.env.TARGET_BRANCH = "main";
process.env.GITHUB_ACCESS_TOKEN = "token";
process.env.COMMITTER_NAME = "committer_name";
process.env.COMMITTER_EMAIL = "committer_name";
process.env.AUTHOR_NAME = "name";
process.env.AUTHOR_EMAIL = "email";

const eventBody = {
  action: "default",
  repository: {
    full_name: "full_name/test",
  },
};

fetchMock.sandbox().post("https://api.github.com/graphql", (url, options) => {
  console.log(options);
  return { data: {} };
});

const mockDate = 1676473416417;
const spy = jest.spyOn(global.Date, "now").mockImplementation(() => mockDate);

describe("dataByEvent", () => {
  describe("dataByAction", () => {
    beforeEach(() => {});

    afterEach(() => {});

    it("returns a filename and a commit message for an event", async () => {
      const data = dataByAction(eventBody);
      expect(data).toStrictEqual({
        path: `full_name/test/${mockDate}.json`,
        message: `auto(data): full_name/test - ${eventBody.action}`,
        content: {
          action: eventBody.action,
          repo: "test",
          owner: "full_name",
        },
      });
    });

    it.only("returns number of commits", async () => {
      fetchMock.mock().post(
        "https://api.github.com/graphql",
        (
          url,
          options: fetchMock.MockRequest & {
            headers: { authorization: string };
          }
        ) => {
          console.log(options.headers.authorization);
          return { data: {} };
        }
      );

      const data = dataByAction({ ...eventBody, action: "completed" });
      expect(data).toStrictEqual({
        path: `full_name/test/${mockDate}.json`,
        message: `auto(data): full_name/test - ${data.content.action}`,
        content: {
          action: data.content.action,
          repo: "test",
          commits: 0,
          owner: "full_name",
        },
      });
    });
  });
});
