import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { LogErrors } from "../../src/shared/log-messages";
import {
  GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME,
  GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME,
  GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME,
} from "../shared/env-vars";
import { EnvVarAccessError } from "../../src/shared/get-env-var";
import {
  HTMLError,
  handleEvent,
  validateRequest,
} from "../../src/shared/source-handling";

const ssmClient = new SSMClient();

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  if (!event.body) {
    return createResponse(400, LogErrors.badRequestError);
  }

  try {
    // Load webhook secret token from AWS Systems Manager
    const githubWebhookSecretToken = await getSecretParameter(
      GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME
    );

    // validation happens in each handler separated to avoid unnecessary calls to secret stores
    validateRequest(event.headers, event.body, githubWebhookSecretToken);

    const githubAccessTokenSourceRepo = await getSecretParameter(
      GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME
    );
    const githubAccessTokenDataRepo = await getSecretParameter(
      GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME
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
}

class MissingParameterError extends Error {
  name = "MissingParameterError";
}

function createResponse(
  statusCode: number,
  message?: string
): APIGatewayProxyResultV2 {
  return {
    statusCode: statusCode,
    body: message,
  };
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
