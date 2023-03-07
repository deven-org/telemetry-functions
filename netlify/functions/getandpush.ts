import { Base64 } from "js-base64";
import { ERRORS } from "../../src/shared/config";
import { isHandlerEvent, areMandatoryEnvVarsSet } from "../../src/shared/utils";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { dataByAction, EventBody } from "../../src/dataByEvent";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import { Octokit } from "@octokit/rest";

const handler: Handler = async (event: HandlerEvent) => {
  try {
    if (!isHandlerEvent(event)) {
      throw new Error(ERRORS.invalidEvent);
    }
    if (!areMandatoryEnvVarsSet()) {
      throw new Error(ERRORS.invalidLocalEnvVar);
    }

    const eventBody: EventBody = JSON.parse(String(event.body));
    const data = dataByAction(eventBody);

    const octokit = new Octokit({
      auth: process.env.GITHUB_ACCESS_TOKEN,
    });

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: process.env.REPO_OWNER as string,
      repo: process.env.REPO_NAME as string,
      path: data.path,
      message: data.message,
      committer: {
        name: process.env.COMMITER_NAME as string,
        email: process.env.COMMITER_EMAIL as string,
      },
      content: Base64.encode(JSON.stringify(data.content)),
    });

    console.log(
      `✅ File "${data.path}" has been created with message: "${data.message}".`
    );
  } catch (e) {
    let errorMessage = e instanceof Error ? e.message : e;
    console.error(`❌ ${errorMessage}`);
    return {
      statusCode: 500,
      body: `${errorMessage}`,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify("success"),
  };
};

export { handler };
