#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TelemetryFunctionsStack } from "../aws/cdk/telemetry-functions-stack";
import { ApiGatewayLoggingPermissionsStack } from "../aws/cdk/api-gateway-logging-permissions";
import * as os from "os";

const userName = os
  .userInfo()
  .username.toLowerCase()
  .replace(/[^a-z0-9-]/, "");
const environment = process.env["ENVIRONMENT_ID"] || `dev-${userName}`;
const nameSuffix = environment == "main" ? "" : `-${environment}`;

const app = new cdk.App();
new TelemetryFunctionsStack(
  app,
  `TelemetryFunctionsStack${nameSuffix}`,
  nameSuffix,
  {
    tags: { environment: environment },
  }
);
if (environment === "main") {
  // Install API gateway logging for main environment only
  // as all environments will use it
  new ApiGatewayLoggingPermissionsStack(
    app,
    "ApiGatewayLoggingPermissionsStack"
  );
}
