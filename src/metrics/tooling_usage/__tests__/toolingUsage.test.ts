import { DataEventSignature } from "../../../interfaces";
import { handler } from "../../../handler";
import mergedCompletedSuccessfully from "./fixtures/merged-completed-successful.json";
import { encode, decode } from "js-base64";
import packagejson from "./../../../../package.json";

const request = jest.fn();

let octokitResponse = {};

jest.mock("./../../../core/octokit.ts", () => ({
  __esModule: true,
  default: {
    request: () => octokitResponse,
  },
}));

describe("Tooling_Usage", () => {
  beforeEach(() => {});

  afterEach(() => {});

  it.only("event gets signed as a toolingUsage event", async () => {
    const eventBody = {
      eventSignature: "toolingUsage",
    };

    octokitResponse = {
      data: {
        content: encode(JSON.stringify(packagejson)),
      },
    };

    const output = await handler(eventBody);

    console.log({ output });

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: {},
      dataEventSignature: DataEventSignature.ToolingUsage,
    });
  });

  it("...", async () => {
    const output = await handler(mergedCompletedSuccessfully);

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      dataEventSignature: "merged-pr",
    });
  });
});
