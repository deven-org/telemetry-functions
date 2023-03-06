import { Base64 } from "js-base64";
import { ERRORS } from "../../src/shared/config";
import { isHandlerEvent, areMandatoryEnvVarsSet } from "../../src/shared/utils";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { dataByAction, EventBody } from "../../src/dataByEvent";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";

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

    console.log(data);
    /*const gh = github.client(process.env.GITHUB_ACCESS_TOKEN);
    const ghrepo = gh.repo(
      `${process.env.REPO_OWNER}/${process.env.REPO_NAME}`
    );
    const path = `${process.env.REPO_PATH}/${
      content.json.repository.full_name
    }/${Date.now()}.json`;
    const action = content.json.action ? `- ${content.json.action}` : null;
    const message = `auto(data): ${content.json.repository.full_name} ${action}`;
    ghrepo.createContents(
      path,
      message,
      JSON.stringify(content.json),
      process.env.TARGET_BRANCH,
      () => {
        console.log(`✅ Content has been created at ${path}.`);
      }
    );*/
  } catch (e) {
    let errorMessage = e instanceof Error ? e.message : e;
    console.error(`❌ ${errorMessage}`);
    return {
      statusCode: 500,
      body: JSON.stringify(errorMessage),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify("success"),
  };
};

export { handler };
