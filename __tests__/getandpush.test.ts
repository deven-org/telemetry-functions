import { handler } from "../netlify/functions/getandpush";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { ERRORS } from "../src/shared/config";
import { dataByAction, EventBody } from "../src/dataByEvent";
import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";

const basicEventObj = {
  body: JSON.stringify("test"),
};

let dataByActionResponse: any = {
  content: "test-content",
  path: "test/path",
  message: "test-message",
};

jest.mock("../src/dataByEvent", () => ({
  __esModule: true,
  dataByAction: jest.fn().mockImplementation(() => dataByActionResponse),
}));

const request = jest.fn();
jest.mock("@octokit/rest", () => {
  return {
    Octokit: function () {
      return {
        request,
      };
    },
  };
});
process.env.REPO_NAME = "telemetry-data";
process.env.REPO_OWNER = "deven-org";
process.env.REPO_PATH = "raw-data";
process.env.TARGET_BRANCH = "main";
process.env.GITHUB_ACCESS_TOKEN = "token";
process.env.COMMITTER_NAME = "committer_name";
process.env.COMMITTER_EMAIL = "committer_name";
process.env.AUTHOR_NAME = "name";
process.env.AUTHOR_EMAIL = "email";

describe("Getandpush", () => {
  describe("handler", () => {
    beforeEach(() => {});

    afterEach(() => {
      dataByActionResponse = {
        content: "test-content",
        path: "test/path",
        message: "test-message",
      };
    });

    it("returns status code 500 with invalidEvent error message", async () => {
      const error = await handler({} as HandlerEvent, {} as HandlerContext);
      expect(error).toStrictEqual({
        body: ERRORS.invalidEvent,
        statusCode: 500,
      });
      expect(dataByAction).toHaveBeenCalledTimes(0);
    });
    it("returns status code 500 with invalidLocalEnvVar error message", async () => {
      delete process.env.GITHUB_ACCESS_TOKEN;
      const error = await handler(
        basicEventObj as HandlerEvent,
        {} as HandlerContext
      );
      expect(error).toStrictEqual({
        body: ERRORS.invalidLocalEnvVar,
        statusCode: 500,
      });
      expect(dataByAction).toHaveBeenCalledTimes(0);
      process.env.GITHUB_ACCESS_TOKEN = "token";
    });
    it("calls dataByAction with the payload", async () => {
      const response = await handler(
        basicEventObj as HandlerEvent,
        {} as HandlerContext
      );
      expect(dataByAction).toHaveBeenCalledWith(JSON.parse(basicEventObj.body));
    });
    it.only("checks validity of data object", async () => {
      dataByActionResponse = { content: {} };
      const response = await handler(
        basicEventObj as HandlerEvent,
        {} as HandlerContext
      );
      expect(response).toStrictEqual({
        statusCode: 500,
        body: ERRORS.invalidDataObject,
      });
    });
    it("call the Octokit request with the right parameters", async () => {
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const eventBody: EventBody = JSON.parse(String(basicEventObj.body));
      await handler(basicEventObj as HandlerEvent, {} as HandlerContext);

      expect(octokit.request).toHaveBeenCalledWith(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: process.env.REPO_OWNER,
          repo: process.env.REPO_NAME,
          path: `test/path`,
          message: "test-message",
          committer: {
            name: process.env.COMMITTER_NAME,
            email: process.env.COMMITTER_EMAIL,
          },
          content: Base64.encode(JSON.stringify("test-content")),
        }
      );
    });
  });
});
