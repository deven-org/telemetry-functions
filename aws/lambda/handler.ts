import {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import * as crypto from "crypto";
import { handler as collectMetricsHandler } from "../../src/handler";
import { RawEvent, TriggerSource } from "../../src/interfaces";
import { LogErrors } from "../../src/shared/log-messages";
import {
  GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME,
  GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME,
  GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME,
} from "../shared/env-vars";
import { EnvVarAccessError } from "../../src/shared/get-env-var";

const SIGNATURE_HEADER = "x-hub-signature-256";
const EVENT_NAME_HEADER = "x-github-event";

const ssmClient = new SSMClient();

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const githubEvent = event.headers[EVENT_NAME_HEADER];
  if (!event.body || !githubEvent) {
    return createResponse(400, LogErrors.badRequestError);
  }

  try {
    const validationError = await validateRequest(event.headers, event.body);
    if (validationError) {
      // Validation failed => stop here
      return validationError;
    }

    const githubAccessTokenSourceRepo = await getSecretParameter(
      GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME
    );
    const githubAccessTokenDataRepo = await getSecretParameter(
      GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME
    );

    const rawEvent: RawEvent = {
      payload: event.body ? JSON.parse(event.body) : null,
      source: TriggerSource.Github,
      sourceEventSignature: githubEvent,
    };

    await collectMetricsHandler(
      rawEvent,
      githubAccessTokenSourceRepo,
      githubAccessTokenDataRepo
    );
  } catch (e: unknown) {
    console.log(e);
    // Responding with an error code here lets us easily resend events from GitHub
    return createResponse(500, LogErrors.genericServerError);
  }

  // Tell Github we accepted the webhook request
  return {
    statusCode: 204,
  };
}

class MissingParameterError extends Error {
  name = "MissingParameterError";
}

function createResponse(
  statusCode: number,
  message: string
): APIGatewayProxyResultV2 {
  return {
    statusCode: statusCode,
    body: message,
  };
}

async function validateRequest(
  headers: APIGatewayProxyEventHeaders,
  body: string
): Promise<APIGatewayProxyResultV2 | undefined> {
  // Github signature header must be present
  if (!headers || !headers[SIGNATURE_HEADER]) {
    return createResponse(400, LogErrors.badRequestError);
  }
  const githubSignature = headers[SIGNATURE_HEADER];

  // Load webhook secret token from AWS Systems Manager
  const githubWebhookSecretToken = await getSecretParameter(
    GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME
  );

  // Verify this request by checking its signature
  if (!verifyGithubSignature(githubSignature, body, githubWebhookSecretToken)) {
    return createResponse(401, LogErrors.forbiddenRequestError);
  }
}

/**
 * Retrieves a secret parameter from AWS Systems Manager. The parameter is the name of
 * an environment variable, not the name of the parameter in Systems Manager. This function
 * reads the environment variable, then retrieves the parameter from Systems Manager.
 *
 * @param envVarName Environment variable which contains the parameter name in AWS Systems Manager
 * @returns Parameter value, decrypted
 */
async function getSecretParameter(envVarName: string): Promise<string> {
  const parameterName = process.env[envVarName];
  if (!parameterName) {
    throw EnvVarAccessError.required(parameterName);
  }

  const readCommand = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  });
  const response = await ssmClient.send(readCommand);
  const parameterValue = response.Parameter?.Value;
  if (!parameterValue) {
    throw new MissingParameterError(
      `Parameter ${parameterName} in AWS Systems Manager must not be empty`
    );
  }

  return parameterValue;
}

function verifyGithubSignature(
  githubSignature: string,
  body: string,
  webhookSecret: string
): boolean {
  const signature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  const trusted = Buffer.from(`sha256=${signature}`, "ascii");
  const untrusted = Buffer.from(githubSignature, "ascii");
  return crypto.timingSafeEqual(trusted, untrusted);
}
