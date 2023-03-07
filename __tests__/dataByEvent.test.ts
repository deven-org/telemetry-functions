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

describe("dataByEvent", () => {
  describe("dataByAction", () => {
    beforeEach(() => {});

    afterEach(() => {});

    it("returns status code 500 with invalidEvent error message", async () => {});
  });
});
