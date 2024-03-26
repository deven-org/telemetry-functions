import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { config as loadEnvironmentVars } from "dotenv";
import { LogErrors } from "../../src/shared/log-messages";
import {
  HTMLError,
  handleEvent,
  validateRequest,
} from "../../src/shared/source-handling";
import { getRequiredEnvVar } from "../../src/shared/get-env-var";

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    loadEnvironmentVars();

    if (!event.body) {
      return createResponse(400, LogErrors.badRequestError);
    }

    const githubWebhookSecretToken = getRequiredEnvVar("WEBHOOK_SECRET");
    // validation happens in each handler separated to avoid unnecessary calls to secret stores
    validateRequest(event.headers, event.body, githubWebhookSecretToken);

    const githubAccessTokenSourceRepo = getRequiredEnvVar(
      "GITHUB_ACCESS_TOKEN"
    );
    const githubAccessTokenDataRepo = getRequiredEnvVar(
      "REPO_WRITE_ACCESS_TOKEN"
    );

    await handleEvent(
      event.headers,
      event.body,
      githubAccessTokenSourceRepo,
      githubAccessTokenDataRepo
    );
  } catch (e: unknown) {
    console.log(e);
    if (e instanceof HTMLError) {
      return createResponse(e.statusCode, e.message);
    }
    // Responding with an error code here lets us easily resend events from GitHub
    return createResponse(500, LogErrors.genericServerError);
  }
  // Tell Github we accepted the webhook request
  return createResponse(204);
};

function createResponse(statusCode: number, message?: string): HandlerResponse {
  return {
    statusCode: statusCode,
    body: message,
  };
}
