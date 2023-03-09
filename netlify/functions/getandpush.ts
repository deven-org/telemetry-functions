import { Base64 } from "js-base64";
import { ERRORS } from "../../src/shared/config";
import { isHandlerEvent, areMandatoryEnvVarsSet } from "../../src/shared/utils";
import { Handler, HandlerEvent } from "@netlify/functions";
import { Data, dataByAction, EventBody } from "../../src/dataByEvent";
import R from "ramda";

import { Octokit } from "@octokit/rest";

export const createObjectError = (e: Error | string) => ({
  statusCode: 500,
  body: e instanceof Error ? e.message : e,
});

function validateHandlerEvent(event: HandlerEvent): Promise<HandlerEvent> {
  return new Promise((res, rej) =>
    isHandlerEvent(event) ? res(event) : rej(ERRORS.invalidEvent)
  );
}

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
  return new Promise((res) => res(dataByAction(eventBody)));
}

function pushDataDoGithub(data: Data): Promise<any> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  });

  return octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
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
}

const handler: Handler = (event: HandlerEvent) =>
  R.pipeWith(R.andThen, [
    validateHandlerEvent,
    validateEnvVars,
    getEventBody,
    createDataObject,
    pushDataDoGithub,
  ])(event).catch(createObjectError);

export { handler };
