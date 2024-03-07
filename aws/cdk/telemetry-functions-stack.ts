import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGW from "aws-cdk-lib/aws-apigatewayv2";
import * as apiGWIntegrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import {
  getRequiredEnvVar,
  getOptionalNumericEnvVar,
  getOptionalEnvVar,
  KnownEnvironmentVariable,
} from "../../src/shared/get-env-var";
import {
  GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME,
  GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME,
  GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME,
} from "../shared/env-vars";

export class TelemetryFunctionsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    nameSuffix: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Names of the parameters in AWS Systems Manager; these parameters contain various secrets
    // Each environment has a different set of parameters, a fixed name plus an environment specific suffix
    const githubWebhookSecretTokenParameter =
      "/telemetry/github-webhook-secret-token" + nameSuffix;
    const githubAccessTokenSourceParameter =
      "/telemetry/github-access-token/source" + nameSuffix;
    const githubAccessTokenDataParameter =
      "/telemetry/github-access-token/data" + nameSuffix;

    const envVariables = this.buildEnvironment();
    // Pass names of parameters in AWS Systems Manager as environment variables
    envVariables[GITHUB_WEBHOOK_SECRET_TOKEN_PARAMETER_NAME] =
      githubWebhookSecretTokenParameter;
    envVariables[GITHUB_ACCESS_TOKEN_SOURCE_PARAMETER_NAME] =
      githubAccessTokenSourceParameter;
    envVariables[GITHUB_ACCESS_TOKEN_DATA_PARAMETER_NAME] =
      githubAccessTokenDataParameter;

    const telemetryFunction = new lambdaNode.NodejsFunction(this, "Telemetry", {
      runtime: lambda.Runtime.NODEJS_20_X,
      // name of the exported function
      handler: "handler",
      // file to use as entry point for our Lambda function
      entry: __dirname + "/../lambda/handler.ts",
      architecture: lambda.Architecture.ARM_64,
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: envVariables,
      memorySize: 256,
      // Github expects to get an answer within 10 seconds
      timeout: cdk.Duration.seconds(9),
    });

    this.grantReadAccessToSskm(
      telemetryFunction,
      "GithubWebhookSecretToken",
      githubWebhookSecretTokenParameter
    );
    this.grantReadAccessToSskm(
      telemetryFunction,
      "GithubAccessTokenSourceRepo",
      githubAccessTokenSourceParameter
    );
    this.grantReadAccessToSskm(
      telemetryFunction,
      "GithubAccessTokenDataRepo",
      githubAccessTokenDataParameter
    );

    const api = new apiGW.HttpApi(this, "Telemetry-Api");
    new cdk.CfnOutput(this, "ApiUrl", { value: `${api.url}telemetry` });
    new cdk.CfnOutput(this, "GithubWebhookParameter", {
      description: "Secret token for GitHub web hook",
      value: githubWebhookSecretTokenParameter,
    });
    new cdk.CfnOutput(this, "SourceRepoParameter", {
      description: "GitHub token to access source repository",
      value: githubAccessTokenSourceParameter,
    });
    new cdk.CfnOutput(this, "DataRepoParameter", {
      description: "GitHub token to access data repository",
      value: githubAccessTokenDataParameter,
    });

    api.addRoutes({
      path: "/telemetry",
      methods: [apiGW.HttpMethod.POST],
      integration: new apiGWIntegrations.HttpLambdaIntegration(
        "post",
        telemetryFunction
      ),
    });

    // Setup logging for API Gateway using escape hatch.
    // See https://github.com/aws/aws-cdk/issues/11100 and
    // https://docs.aws.amazon.com/cdk/latest/guide/cfn_layer.html#cfn_layer_resource
    // for more information.
    const apiLog = new logs.LogGroup(this, "Telemetry-Api-AccessLog", {
      retention: logs.RetentionDays.ONE_WEEK,
    });
    const apiStage = api.defaultStage?.node.defaultChild as apiGW.CfnStage;
    apiStage.accessLogSettings = {
      destinationArn: apiLog.logGroupArn,
      format: JSON.stringify({
        requestId: "$context.requestId",
        requestTime: "$context.requestTime",
        httpMethod: "$context.httpMethod",
        routeKey: "$context.routeKey",
        status: "$context.status",
        protocol: "$context.protocol",
        responseLength: "$context.responseLength",
        errorMessage: "$context.error.message",
      }),
    };
  }

  grantReadAccessToSskm(
    grantee: cdk.aws_iam.IGrantable,
    parameterId: string,
    parameterName: string
  ) {
    const ssmParameter =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        parameterId,
        {
          parameterName: parameterName,
        }
      );
    ssmParameter.grantRead(grantee);
  }

  buildEnvironment(): Record<string, string> {
    const environment = {
      REPO_NAME: getRequiredEnvVar("REPO_NAME"),
      REPO_OWNER: getRequiredEnvVar("REPO_OWNER"),
      REPO_PATH: getRequiredEnvVar("REPO_PATH"),
      TARGET_BRANCH: getRequiredEnvVar("TARGET_BRANCH"),
    };
    this.addOptionalNumericEnvVar(environment, "CONFLICT_RETRIES");
    this.addOptionalEnvVar(environment, "AUTHOR_NAME");
    this.addOptionalEnvVar(environment, "AUTHOR_EMAIL");
    this.addOptionalEnvVar(environment, "COMMITTER_NAME");
    this.addOptionalEnvVar(environment, "COMMITTER_EMAIL");
    return environment;
  }

  addOptionalEnvVar(
    environment: Record<string, string>,
    variable: KnownEnvironmentVariable
  ) {
    const value = getOptionalEnvVar(variable);
    if (value) {
      environment[variable] = value.toString();
    }
    return environment;
  }

  addOptionalNumericEnvVar(
    environment: Record<string, string>,
    variable: KnownEnvironmentVariable
  ) {
    const value = getOptionalNumericEnvVar(variable);
    if (value) {
      environment[variable] = value.toString();
    }
    return environment;
  }
}
