import R from "ramda";
import { Base64 } from "js-base64";
import { ERRORS, MANDATORY_ENV_VARS } from "../../src/shared/config";
import { Handler, HandlerEvent } from "@netlify/functions";
import { Data, EventBody } from "../../src/interface";
import { dataByAction } from "../../src/features/dataByAction";
import { Octokit } from "@octokit/rest";

export const isHandlerEvent = (obj) => R.propIs(String, "body")(obj);

export const areMandatoryEnvVarsSet = (vars) => {
  return R.pipe(
    R.keys,
    R.difference(MANDATORY_ENV_VARS),
    R.length,
    R.equals(0)
  )(vars);
};

export const throwError = (message: string): never => {
  throw new Error(message);
};

export const createObjectError = (e: Error | string) => ({
  statusCode: 500,
  body: e instanceof Error ? e.message : e,
});

function validateHandlerEvent(event: HandlerEvent): Promise<HandlerEvent> {
  return new Promise((res, rej) =>
    isHandlerEvent(event) ? res(event) : rej(ERRORS.invalidEvent)
  );
}

export const validateDataObject = (data) =>
  R.allPass([
    R.propIs(String, "path"),
    R.propIs(String, "message"),
    R.propIs(Object, "content"),
  ])(data);

function validateEnvVars(event: HandlerEvent): Promise<HandlerEvent> {
  return new Promise((res, rej) =>
    areMandatoryEnvVarsSet(process.env)
      ? res(event)
      : rej(ERRORS.invalidLocalEnvVar)
  );
}

function getEventBody(event): Promise<EventBody> {
  return new Promise((res) => res(JSON.parse(String(event.body))));
}

function createDataObject(eventBody: EventBody): Promise<Data> {
  return new Promise((res, rej) => {
    const data = dataByAction(eventBody);
    validateDataObject(data) ? res(data) : rej(ERRORS.invalidDataObject);
  });
}

function pushDataToGithub(data: Data): Promise<any> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  });

  return octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: process.env.REPO_OWNER as string,
    repo: process.env.REPO_NAME as string,
    path: data.path,
    message: data.message,
    committer: {
      name: process.env.COMMITTER_NAME as string,
      email: process.env.COMMITTER_EMAIL as string,
    },
    content: Base64.encode(JSON.stringify(data.content)),
  });
}

const handler: Handler = (event: HandlerEvent) =>
  R.pipeWith(R.andThen, [
    validateHandlerEvent,
    validateEnvVars,
    getEventBody,
    createDataObject,
    pushDataToGithub,
  ])(event).catch(createObjectError);

export { handler, createDataObject };
