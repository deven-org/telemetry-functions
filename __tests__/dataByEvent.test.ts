import { handler } from "../netlify/functions/getandpush";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { ERRORS } from "../src/shared/config";
import { dataByAction, EventBody } from "../src/dataByEvent";
import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";

const basicEventObj = {
  body: JSON.stringify("test"),
};

process.env.REPO_NAME = "telemetry-data";
process.env.REPO_OWNER = "deven-org";
process.env.REPO_PATH = "raw-data";
process.env.TARGET_BRANCH = "main";
process.env.GITHUB_ACCESS_TOKEN = "token";
process.env.COMMITER_NAME = "commiter_name";
process.env.COMMITER_EMAIL = "commiter_name";
process.env.AUTHOR_NAME = "name";
process.env.AUTHOR_EMAIL = "email";

const eventBody = {
  action: "action",
  repository: {
    full_name: "full_name/test",
  },
};

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

    it("......", async () => {});
  });
});
