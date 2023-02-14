import { Handler, HandlerEvent } from "@netlify/functions";
import { Base64 } from "js-base64";
import { Octokit } from "@octokit/rest";

const isValidEvent = (arg: any): boolean =>
  arg && arg.body && typeof arg.body === "string";

const errors = {
  invalidRequest: "Invalid request: the body isn't a valid JSON string.",
  localEnvVarNotSet: "One or more environment variables are not set.",
};

const mandatoryEnvVars = [
  "REPO_NAME",
  "REPO_OWNER",
  "REPO_PATH",
  "TARGET_BRANCH",
  "GITHUB_ACCESS_TOKEN",
  "COMMITER_NAME",
  "COMMITER_EMAIL",
  "AUTHOR_NAME",
  "AUTHOR_EMAIL",
];

const handler: Handler = async (event: HandlerEvent) => {
  try {
    // Check if the recevied event is valid)
    if (!isValidEvent(event)) {
      console.error("❌ The event is not valid");
      throw new Error(errors.invalidRequest);
    } else {
      console.info("✅ The event is valid");
    }

    // Check if all the required environment variables are set
    mandatoryEnvVars.forEach((p) => {
      if (!process.env.hasOwnProperty(p) || !p) {
        console.error(`❌ The environment variable ${p} is not correctly set`);
        throw new Error(errors.localEnvVarNotSet);
      } else {
        console.info(`✅ The environment variable ${p} is correctly set`);
      }
    });

    // Encodes the body of the event as a base64 string
    const fileContent = Base64.encode(String(event.body));
    console.info(`✅ The content has been encoded as base64`);

    const fileContentAsJson = JSON.parse(String(event.body));
    // Build the git object
    const gitObject = {
      owner: process.env.REPO_OWNER as string,
      repo: process.env.REPO_NAME as string,
      path: `${process.env.REPO_PATH}/${
        fileContentAsJson.repository.full_name
      }/${Date.now()}.json`,
      branch: process.env.TARGET_BRANCH,
      message: `auto(data): ${fileContentAsJson.repository.full_name} - ${fileContentAsJson.action}"`,
      content: fileContent,
      committer: {
        name: process.env.COMMITER_NAME as string,
        email: process.env.COMMITER_EMAIL as string,
      },
      author: {
        name: process.env.AUTHOR_NAME as string,
        email: process.env.AUTHOR_EMAIL as string,
      },
    };
    console.info(`✅ The git object has been created`);

    // Get the octokit instance
    const octokit = new Octokit({
      auth: process.env.GITHUB_ACCESS_TOKEN,
    });
    console.info(`✅ The octokit instance has been created`);
    await octokit
      .request("PUT /repos/{owner}/{repo}/contents/{path}", gitObject)
      .catch(console.log);
    console.info(`✅ The file has been pushed to the repo`);
  } catch (e: unknown) {
    let errorMessage;
    if (typeof e === "string") {
      errorMessage = e.toUpperCase();
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(`❌ ${e}`);

    return {
      statusCode: 500,
      body: JSON.stringify(errorMessage),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(""),
  };
};

export { handler };
